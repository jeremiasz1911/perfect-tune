import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FaMusic, FaGuitar, FaMicrophone, FaDrum, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign
} from "react-icons/fa";
import {
  getLatestUnpaidInvoiceId,
  // ⬇⬇⬇ DODAJ TEN IMPORT
  createEnrollmentRequest,
  getEnrollmentsByChildId,
  startPaymentForInvoice,
} from "@/lib/db";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";


interface ChildData {
  id: string;
  name: string;
  surname: string;
  age: number;
}

interface ClassData {
  id: string;
  childId: string;
  childName: string;
  className: string;
  schedule: string;
  location: string;
  status: string;
  nextClass: string;
  attendance: number;
}

type EnrolledClass = {
  enrollmentId: string;
  classId: string;        // id lekcji (lessons/<id> lub classes/<id>)
  className: string;
  schedule: string;
  location: string;
  billingModel: "monthly" | "per_lesson";
  price: number;
  status: string;         // active/inactive
};

type BillingModel = "monthly" | "per_lesson";

interface AvailableClass {
  id: string;                 // == lessonId
  name: string;
  type: string;
  description: string;
  instructor: string;
  schedule: string;
  location: string;
  ageRange: string;
  price: number;
  billingModel: BillingModel; // ⬅ dodane
  capacity: number;
  spotsLeft: number;
}

interface ClassRegistrationProps {
  children: ChildData[];
  classes: ClassData[];
}

const ClassRegistration = ({ children, classes }: ClassRegistrationProps) => {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [activeTab, setActiveTab] = useState("enrolled");
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classTypeFilter, setClassTypeFilter] = useState<string>("all");
  const [enrolled, setEnrolled] = useState<EnrolledClass[]>([]);

  const user = auth.currentUser;
  const parentId = user?.uid ?? "";
  const { toast } = useToast();

  const base = import.meta.env.VITE_API_BASE_URL; 

function postToGateway(gatewayUrl: string, form: Record<string, any>) {
  if (!gatewayUrl || !form || typeof form !== "object") return;

  const formEl = document.createElement("form");
  formEl.method = "POST";
  formEl.action = gatewayUrl;
  formEl.style.display = "none";

  Object.entries(form).forEach(([k, v]) => {
    // zachowaj wartość dokładnie taką, jak przyszła z backendu
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    // jeżeli backend zwróci stringi – super. Jeżeli liczby, NIE formatuj na siłę.
    input.value = typeof v === "string" ? v : (v != null ? String(v) : "");
    formEl.appendChild(input);
  });

  document.body.appendChild(formEl);
  console.log("[Tpay submit]", gatewayUrl, form);
  formEl.submit();
}


async function payByInvoiceCF(invoiceId: string, childId: string) {
  // 1) Pobierz fakturę
  const invSnap = await getDoc(doc(db, "invoices", invoiceId));
  if (!invSnap.exists()) throw new Error("Invoice not found");
  const inv: any = invSnap.data();

  // 2) Dane do payloadu
  const raw = inv.amountGross ?? inv.amount ?? inv.total ?? 0;
  const amount =
  typeof raw === "number"
    ? (Number.isInteger(raw) && raw > 100 ? raw / 100 : raw)
    : parseFloat(String(raw));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid invoice amount");
  }
  const description = String(inv.description || "Opłata za zajęcia");
  const parentId = auth.currentUser?.uid || "";

  // studentName z children/<childId>
  let studentName = "Student";
  const cSnap = await getDoc(doc(db, "children", childId));
  if (cSnap.exists()) {
    const c: any = cSnap.data();
    const nm = [c.name, c.surname].filter(Boolean).join(" ").trim();
    if (nm) studentName = nm;
  }

  // parentName + email z auth/users/<uid>
  let parentName = auth.currentUser?.displayName || "Parent";
  let email = auth.currentUser?.email || "";
  if (parentId) {
    const uSnap = await getDoc(doc(db, "users", parentId));
    if (uSnap.exists()) {
      const u: any = uSnap.data();
      parentName = u.fullName || u.name || parentName;
      email = email || u.email || "";
    }
  }
  if (!email) throw new Error("Brak e-maila płatnika");

  const origin = window.location.origin;
  const returnUrl  = `${origin}/payments/return?invoiceId=${invoiceId}`;
  const failureUrl = `${origin}/payments/return?invoiceId=${invoiceId}&status=failed`;

  const res = await fetch(`${base}/initiatePayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      description,
      studentName,
      parentName,
      userId: parentId,
      email,
      returnUrl,
      successUrl: returnUrl,
      failureUrl,
    }),
  });

  const txt = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);

  const { gatewayUrl, form } = JSON.parse(txt);
  if (!gatewayUrl || !form) throw new Error("Nieprawidłowa odpowiedź z backendu");

  // 4) Auto-POST do Tpay (pełny komplet pól)
  postToGateway(gatewayUrl, form);
}



async function payInvoiceViaCF(invoiceId: string) {
  try {
    // 1) Pobierz fakturę
    const invSnap = await getDoc(doc(db, "invoices", invoiceId));
    if (!invSnap.exists()) {
      toast({ title: "Invoice not found", description: "Nie znaleziono rachunku.", variant: "destructive" });
      return;
    }
    const inv: any = invSnap.data();

    // 2) Walidacja i przygotowanie danych
    const raw = inv.amountGross ?? inv.amount ?? inv.total ?? 0;
    const amount =
    typeof raw === "number"
      ? (Number.isInteger(raw) && raw > 100 ? raw / 100 : raw)
      : parseFloat(String(raw));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid invoice amount");
    }
    const currency = String(inv.currency || "PLN");
    const description = String(inv.description || "Opłata za zajęcia");
    const parentId = auth.currentUser?.uid || "";

    // e-mail z auth lub users/<uid>
    let email = auth.currentUser?.email || "";
    if (!email && parentId) {
      const u = await getDoc(doc(db, "users", parentId));
      email = (u.exists() && (u.data() as any)?.email) || "";
    }

    if (!amount || amount <= 0) {
      toast({ title: "Błąd płatności", description: "Nieprawidłowa kwota na fakturze.", variant: "destructive" });
      return;
    }
    if (!email) {
      toast({ title: "Brak e-maila", description: "Uzupełnij e-mail na koncie, aby opłacić rachunek.", variant: "destructive" });
      return;
    }

    const origin = window.location.origin;
    const returnUrl = `${origin}/payments/return?invoiceId=${invoiceId}`;
    const failureUrl = `${origin}/payments/return?invoiceId=${invoiceId}&status=failed`;

    // 3) Payload dla CF – dajemy aliasy nazw pól, żeby backend nie marudził
    const payload = {
      invoiceId,                     // często wymagane top-level
      amount,
      amountMinorUnits: Math.round(amount * 100),
      currency,
      description,
      userId: parentId,
      email,                         // alias A
      payerEmail: email,             // alias B
      customerEmail: email,          // alias C
      returnUrl,                     // alias A
      successUrl: returnUrl,         // alias B
      failureUrl,
      meta: {
        invoiceId,
        classId: inv.classId,
        childId: inv.childId,
        parentId,
      },
    };

    // 4) Spróbuj CF /initiatePayment
    let usedFallback = false;
    try {
      const res = await fetch(`${base}/initiatePayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error("Nieprawidłowa odpowiedź z backendu (brak JSON).");
      }

      // Preferuj bezpośredni redirect
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Fallback na form POST – ale nie wysyłaj pustych wartości
      if (data.gatewayUrl && data.form && Object.keys(data.form).length) {
        postToGateway(data.gatewayUrl, data.form);
        return;
      }

      // Jeśli tu dotarliśmy, odpowiedź nie zawiera nic użytecznego
      throw new Error("Backend nie zwrócił redirectUrl ani poprawnego 'form'.");
    } catch (e) {
      console.warn("[/initiatePayment] błąd/niepełna odp. – fallback na startPaymentForInvoice:", e);
      usedFallback = true;
    }

    // 5) Fallback – gwarantowany flow z db.ts (działa od ręki)
    const res2 = await startPaymentForInvoice({ invoiceId, payerEmail: email, returnUrl });
    if (typeof res2 === "string" && res2) {
      // czasem backend zwraca URL do redirectu
      window.location.href = res2;
      return;
    }

    if (res2 && typeof res2 === "object") {
      const { gatewayUrl, form, redirectUrl } = res2 as any;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      if (gatewayUrl && form) {
        postToGateway(gatewayUrl, form);
        return;
      }
    }

  throw new Error("Nie udało się uzyskać adresu płatności.");
  } catch (err: any) {
    console.error(err);
    toast({ title: "Błąd płatności", description: String(err?.message || err), variant: "destructive" });
  }
}


  // ⬇ Pobierz dostępne lekcje (z lessons)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "lessons"));
        const list: AvailableClass[] = snap.docs.map(d => {
          const data: any = d.data();

          const scheduleText = data?.schedule
            ? [
                (data.schedule?.days || []).join(", "),
                [data.schedule?.startTime, data.schedule?.endTime].filter(Boolean).join("–"),
              ].filter(Boolean).join(" • ")
            : "—";

          // ustal model i cenę
          const inferModel: BillingModel =
            (data?.billing?.model as BillingModel) ||
            (data?.billing?.pricePerLesson != null || data?.price != null
              ? "per_lesson"
              : "monthly");

          const price =
            inferModel === "monthly"
              ? Number(data?.billing?.priceMonthly ?? data?.price ?? 0)
              : Number(data?.billing?.pricePerLesson ?? data?.price ?? 0);

          return {
            id: d.id,
            name: data?.title || data?.name || "Zajęcia",
            type: data?.type || "instrument",
            description: data?.description || "",
            instructor: data?.instructor || "",
            schedule: scheduleText,
            location: data?.location || "",
            ageRange: data?.ageRange || "",
            price,
            billingModel: inferModel, // ⬅
            capacity: Number(data?.capacity || 0),
            spotsLeft:
              typeof data?.spotsLeft === "number"
                ? data.spotsLeft
                : Math.max(0, Number(data?.capacity || 0) - Number((data?.participants || []).length || 0)),
          };
        });

        setAvailableClasses(list);
      } catch (e) {
        console.error(e);
        toast({
          title: "Błąd",
          description: "Nie udało się wczytać zajęć z bazy.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);
  
  useEffect(() => {
    if (!selectedChild) {
      setEnrolled([]);
      return;
    }
    (async () => {
      try {
        const enrolls = await getEnrollmentsByChildId(selectedChild);
        const rows: EnrolledClass[] = await Promise.all(
          (enrolls || [])
            .filter((e: any) => e?.status !== "inactive")
            .map(async (e: any) => {
              // spróbuj lessons, fallback do classes
              const lref = doc(db, "lessons", e.classId);
              let snap = await getDoc(lref);
              if (!snap.exists()) {
                snap = await getDoc(doc(db, "classes", e.classId));
              }
              const data: any = snap.exists() ? snap.data() : {};

              const scheduleText = data?.schedule
                ? [
                    (data.schedule?.days || []).join(", "),
                    [data.schedule?.startTime, data.schedule?.endTime]
                      .filter(Boolean)
                      .join("–"),
                  ]
                    .filter(Boolean)
                    .join(" • ")
                : "—";

              const billingModel: BillingModel =
                (data?.billing?.model as BillingModel) ||
                (data?.billing?.pricePerLesson != null || data?.price != null
                  ? "per_lesson"
                  : "monthly");

              const price =
                billingModel === "monthly"
                  ? Number(data?.billing?.priceMonthly ?? data?.price ?? 0)
                  : Number(data?.billing?.pricePerLesson ?? data?.price ?? 0);

              return {
                enrollmentId: e.id,
                classId: e.classId,
                className: data?.title || data?.name || "Zajęcia",
                schedule: scheduleText,
                location: data?.location || "",
                billingModel,
                price,
                status: e?.status || "active",
              };
            })
        );
        setEnrolled(rows);
      } catch (err) {
        console.error(err);
        toast({
          title: "Błąd",
          description: "Nie udało się wczytać zapisanych zajęć.",
          variant: "destructive",
        });
      }
    })();
  }, [selectedChild, toast]);


  // ⬇ Rejestracja: ZAMIAR → wniosek do admina
  const handleRegister = async () => {
    if (!selectedChild) {
      toast({ title: "Child Not Selected", description: "Select a child first.", variant: "destructive" });
      return;
    }
    if (!selectedClass) return;
    if (!user) {
      toast({ title: "Not signed in", description: "Please log in to enroll.", variant: "destructive" });
      return;
    }

    setIsRegistering(true);
    try {
      await createEnrollmentRequest({
        parentId,
        childId: selectedChild,
        lessonId: selectedClass.id,  // ⬅ WAŻNE: lessonId
        action: "enroll",
      });

      toast({
        title: "Request sent",
        description:
          "Twoje zgłoszenie zostało wysłane do administratora. Po akceptacji dostaniesz powiadomienie i możliwość opłaty.",
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Błąd",
        description: String(err?.message || err),
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // ⬇ Wypisanie: też wniosek do admina
  const handleUnenroll = async (classId: string, childId: string) => {
    if (!classId) {
      toast({ title: "Brak ID zajęć", description: "Nie udało się ustalić lekcji do wypisania.", variant: "destructive" });
      return;
   }
    if (!confirm("Are you sure you want to request unenrollment from this class?")) return;
    if (!user) {
      toast({ title: "Not signed in", description: "Please log in first.", variant: "destructive" });
      return;
    }
    try {
      await createEnrollmentRequest({
        parentId,
        childId,
        lessonId: classId,   // ⬅ przekazujemy id lekcji
        action: "unenroll",
      });
      toast({
        title: "Request sent",
        description: "Wniosek o wypisanie wysłany do administratora.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Błąd",
        description: String(err?.message || err),
        variant: "destructive",
      });
    }
  };

  // ⬇ „Zapłać teraz” – bez zmian, ale funkcja była niewidoczna w tym pliku
  const handlePayNow = async (classId: string, childId: string) => {
  if (!user) {
    toast({ title: "Not signed in", description: "Please log in to pay.", variant: "destructive" });
    return;
  }

  // znajdź najnowszą nieopłaconą fakturę
  const invoiceId = await getLatestUnpaidInvoiceId(parentId, childId, classId);
  if (!invoiceId) {
    toast({ title: "Brak płatności", description: "Nie ma oczekującego rachunku." });
    return;
  }

  try {
    await payByInvoiceCF(invoiceId, childId);
  } catch (e: any) {
    console.error(e);
    toast({ title: "Błąd płatności", description: String(e?.message || e), variant: "destructive" });
  }
};






  const getChildName = (childId: string): string => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.name} ${child.surname}` : "Unknown Child";
  };

  const getChildClasses = (): EnrolledClass[] => enrolled;


  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case "instrument": return <FaGuitar className="text-primary" />;
      case "vocal": return <FaMicrophone className="text-primary" />;
      case "theory": return <FaMusic className="text-primary" />;
      case "ensemble": return <FaDrum className="text-primary" />;
      default: return <FaMusic className="text-primary" />;
    }
  };

  const filteredAvailableClasses = classTypeFilter === "all"
    ? availableClasses
    : availableClasses.filter(c => c.type === classTypeFilter);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Class Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Select a Child</CardTitle>
            <CardDescription>Choose a child to view their classes or register for new ones</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} {child.surname} (Age: {child.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedChild && (
        <div>
          <h3 className="text-xl font-semibold mb-4">{getChildName(selectedChild)}'s Classes</h3>

          <Tabs defaultValue="enrolled" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="enrolled">Enrolled Classes</TabsTrigger>
              <TabsTrigger value="available">Available Classes</TabsTrigger>
            </TabsList>

            <TabsContent value="enrolled">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getChildClasses(selectedChild).length > 0 ? (
                  getChildClasses(selectedChild).map((classItem) => (
                    <Card key={classItem.enrollmentId || `${classItem.classId}-${selectedChild}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{classItem.className}</CardTitle>
                         <Badge variant={classItem.status?.toLowerCase() === "active" ? "default" : "secondary"}>
                          {classItem.status}
                        </Badge>
                        </div>
                        <CardDescription>{classItem.schedule}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-primary mr-2" size={14} />
                            <span className="text-sm">{classItem.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-primary mr-2" size={14} />
                            <span className="text-sm">Next class: {classItem.nextClass}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMusic className="text-primary mr-2" size={14} />
                            <span className="text-sm">Attendance: {classItem.attendance}%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FaDollarSign className="text-primary mr-2" size={14} />
                          <span className="text-sm">
                            {classItem.billingModel === "monthly"
                              ? `Fee: $${classItem.price}/month`
                              : `Price: $${classItem.price} / lesson`}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={() => {/* opcjonalnie transfer flow */}}>
                          Transfer
                        </Button>
                        <Button size="sm" onClick={() => handlePayNow(classItem.classId, selectedChild)}>
                          Pay
                        </Button>
                        <Button onClick={() => console.log(classItem.classId, selectedChild)}>
                          TEST
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleUnenroll(classItem.classId, selectedChild)}
                        >
                          Unenroll
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 text-center bg-neutral-50 rounded-lg">
                    <FaMusic className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Classes Enrolled</h3>
                    <p className="text-neutral-600 mb-4">
                      {getChildName(selectedChild)} is not currently enrolled in any classes.
                    </p>
                    <Button onClick={() => setActiveTab("available")}>Browse Available Classes</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="available">
              <div className="mb-6">
                <h4 className="font-medium mb-2">Filter by Class Type</h4>
                <div className="flex flex-wrap gap-2">
                  {["all","instrument","vocal","theory","ensemble"].map(v => (
                    <Button
                      key={v}
                      variant={classTypeFilter === v ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassTypeFilter(v)}
                      className={classTypeFilter === v ? "bg-primary hover:bg-primary-dark" : ""}
                    >
                      {v === "instrument" && <FaGuitar className="mr-2" size={12} />}
                      {v === "vocal" && <FaMicrophone className="mr-2" size={12} />}
                      {v === "theory" && <FaMusic className="mr-2" size={12} />}
                      {v === "ensemble" && <FaDrum className="mr-2" size={12} />}
                      {v === "all" ? "All Classes" : v[0].toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAvailableClasses.length > 0 ? (
                  filteredAvailableClasses.map((classItem) => (
                      <Card key={classItem.enrollmentId || `${classItem.classId}-${selectedChild}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getClassTypeIcon(classItem.type)}
                            <CardTitle className="ml-2">{classItem.name}</CardTitle>
                          </div>
                          <Badge variant={classItem.status?.toLowerCase() === "active" ? "default" : "secondary"}>
                            {classItem.spotsLeft} spots left
                          </Badge>
                        </div>
                        <CardDescription>{classItem.instructor}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-neutral-600 mb-3">{classItem.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <FaClock className="text-primary mr-2" size={14} />
                            <span>{classItem.schedule}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-primary mr-2" size={14} />
                            <span>{classItem.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMusic className="text-primary mr-2" size={14} />
                            <span>Ages {classItem.ageRange}</span>
                          </div>
                          <div className="flex items-center">
                            <FaDollarSign className="text-primary mr-2" size={14} />
                            <span>
                              ${classItem.price}
                              {classItem.billingModel === "monthly" ? "/month" : " per lesson"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t">
                        <Dialog
                          open={isDialogOpen && selectedClass?.id === classItem.id}
                          onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setSelectedClass(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button className="w-full" onClick={() => setSelectedClass(classItem)}>
                              Enroll Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Enrollment</DialogTitle>
                              <DialogDescription>
                                You are about to enroll {getChildName(selectedChild)} in {classItem.name}.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-4">
                              <div className="bg-neutral-50 p-4 rounded-lg space-y-2 mb-4">
                                <div className="flex justify-between">
                                  <span className="font-medium">Class:</span>
                                  <span>{classItem.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Schedule:</span>
                                  <span>{classItem.schedule}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Location:</span>
                                  <span>{classItem.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {classItem.billingModel === "monthly" ? "Monthly Fee:" : "Price per lesson:"}
                                  </span>
                                  <span className="font-bold">
                                    ${classItem.price}{classItem.billingModel === "monthly" ? ".00" : ""}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-neutral-600">
                                By clicking "Confirm Enrollment," you agree to our terms and conditions, including our payment and cancellation policies.
                              </p>
                            </div>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isRegistering}>
                                Cancel
                              </Button>
                              <Button onClick={handleRegister} disabled={isRegistering}>
                                {isRegistering ? (
                                  <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enrolling...
                                  </div>
                                ) : (
                                  "Confirm Enrollment"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 text-center bg-neutral-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
                    <p className="text-neutral-600">There are no available classes matching your filter criteria.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setClassTypeFilter("all")}>
                      View All Classes
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!selectedChild && (
        <div className="p-8 text-center bg-neutral-50 rounded-lg">
          <FaMusic className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Child Selected</h3>
          <p className="text-neutral-600 mb-4">
            Please select a child above to view their classes or register for new ones.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassRegistration;
