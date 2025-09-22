import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getUserByUid, getChildrenByParentId, getEnrollmentsByChildId, getPaymentsByUserId } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import ChildrenManager from "@/components/parent/ChildrenManager";
import ClassRegistration from "@/components/parent/ClassRegistration";
import PaymentHistory from "@/components/parent/PaymentHistory";
import { FaHome, FaMusic, FaCreditCard, FaCog, FaCalendarAlt, FaChild, FaBell } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

/* ===== helpers / styl tła jak na HomePage ===== */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/></svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;
const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d, ease: [0.22, 0.61, 0.36, 1] } },
});
const formatPLN = (amount: number) =>
  amount.toLocaleString("pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 0 });

/* ===== typy ===== */
interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string;
}
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
  /** ISO string lub "" jeśli brak — do sortowania/parsu */
  nextClassISO: string;
  attendance: number;
}
interface PaymentData {
  id: string;
  description: string;
  amount: number;
  date: string;    // tylko do wyświetlania
  status: string;  // Paid / Due / Pending ...
  studentName: string;
}

const ParentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // UŻYTKOWNIK
        const userDataResult = await getUserByUid(user.uid);
        if (userDataResult) {
          setUserData({
            id: userDataResult.id,
            name: userDataResult.name,
            surname: userDataResult.surname,
            email: userDataResult.email,
          });
        }

        // DZIECI
        const childrenResult = await getChildrenByParentId(user.uid);
        setChildren(childrenResult || []);

        // ENROLLMENTS -> LEKCJE
        const allEnrollments = (
          await Promise.all((childrenResult || []).map((ch) => getEnrollmentsByChildId(ch.id)))
        ).flat();

        const classRows: ClassData[] = [];
        for (const enr of allEnrollments) {
          const child = (childrenResult || []).find((c) => c.id === enr.childId);

          // Pobierz z "lessons" albo fallback do "classes"
          let snap = await getDoc(doc(db, "lessons", enr.classId));
          let data: any | null = snap.exists() ? snap.data() : null;
          if (!data) {
            const alt = await getDoc(doc(db, "classes", enr.classId));
            data = alt.exists() ? alt.data() : null;
          }
          if (!data) continue;

          // Tekst planu
          const scheduleText = data?.schedule
            ? [
                (data.schedule?.days || []).join(", "),
                [data.schedule?.startTime, data.schedule?.endTime].filter(Boolean).join("–"),
              ]
                .filter(Boolean)
                .join(" • ")
            : "—";

          // !!! WAŻNE: trzymaj ISO do sort/parsu (NIE toLocaleString)
          const nextDate = data?.schedule?.date?.toDate?.()
            ? data.schedule.date.toDate()
            : null;
          const nextClassISO = nextDate ? nextDate.toISOString() : "";

          classRows.push({
            id: enr.id,
            childId: enr.childId,
            childName: child ? `${child.name} ${child.surname}` : "",
            className: data.title || data.name || "Zajęcia",
            schedule: scheduleText,
            location: data.location || "PerfectTune Studio",
            status: enr.status || "Active",
            nextClassISO,
            attendance: 0,
          });
        }
        setClasses(classRows);

        // PŁATNOŚCI
        const paymentsRes = await getPaymentsByUserId(user.uid);
        const paymentRows: PaymentData[] = (paymentsRes || []).map((p: any) => ({
          id: p.id,
          description: p.description || "Płatność",
          amount: Number(p.amount ?? 0),
          date: p.paymentDate?.toDate?.()
            ? p.paymentDate.toDate().toLocaleDateString("pl-PL")
            : new Date().toLocaleDateString("pl-PL"),
          status: String(p.status || "pending"),
          studentName: p.studentName || (childrenResult?.[0]?.name ?? ""),
        }));
        setPayments(paymentRows);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować panelu. Spróbuj ponownie.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  /* ===== pochodne ===== */
  const upcomingClasses = useMemo(() => {
    const parseISO = (iso: string) => {
      const d = iso ? new Date(iso) : null;
      return d && !isNaN(d.getTime()) ? d : null;
    };
    return classes
      .filter((c) => ["Active", "Starting Soon"].includes(c.status))
      .map((c) => ({ ...c, _dt: parseISO(c.nextClassISO) }))
      .filter((c) => c._dt)
      .sort((a, b) => (a._dt!.getTime() - b._dt!.getTime()))
      .slice(0, 3);
  }, [classes]);

  const outstandingPayment = useMemo(() => {
    const wanted = new Set(["due", "pending", "unpaid", "past_due"]);
    return payments.find((p) => wanted.has(p.status.toLowerCase()));
  }, [payments]);

  /* ===== UI ===== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#0B0F19]">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel rodzica — PerfectTune</title>
        <meta name="description" content="Zarządzaj zajęciami dzieci, płatnościami i zapisami w PerfectTune." />
      </Helmet>

      <div className="relative min-h-screen bg-[#0B0F19] text-white">
        {/* tło */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(1200px 600px at 10% -10%, rgba(88,101,242,.22), transparent 55%),
              radial-gradient(900px 480px at 90% 0%, rgba(186,230,253,.18), transparent 60%),
              radial-gradient(1000px 800px at 50% 120%, rgba(56,189,248,.10), transparent 55%),
              url("${DOT_DATA_URL}")
            `,
            backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
            backgroundSize: "auto, auto, auto, 32px 32px",
          }}
        />

        {/* nagłówek deski */}
        <header className="relative border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-lg">Panel rodzica</span>
              <span className="text-white/60">| PerfectTune</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-white/85 hover:bg-white/10">
                  <FaBell className="h-5 w-5" />
                </Button>
                {outstandingPayment && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-neutral-900 flex items-center justify-center font-bold">
                  {userData?.name?.[0] || "U"}
                </div>
                <span className="ml-2 text-white/85 hidden md:block">
                  {userData?.name} {userData?.surname}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* zawartość */}
        <div className="relative container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex w-full">
            {/* sidebar */}
            <motion.aside
              {...fadeUp(0.02)}
              className="w-full md:w-64 mb-8 md:mb-0 md:mr-8"
            >
              <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <TabsList className="flex flex-col bg-transparent h-auto gap-2">
                  <TabsTrigger value="overview" className="justify-start data-[state=active]:bg-white/10">
                    <FaHome className="mr-3" />
                    Przegląd
                  </TabsTrigger>
                  <TabsTrigger value="classes" className="justify-start data-[state=active]:bg-white/10">
                    <FaMusic className="mr-3" />
                    Zajęcia
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="justify-start data-[state=active]:bg-white/10">
                    <FaCreditCard className="mr-3" />
                    Płatności
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="justify-start data-[state=active]:bg-white/10">
                    <FaCog className="mr-3" />
                    Ustawienia konta
                  </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                  <h3 className="font-bold mb-2">Dzieci</h3>
                  <ul className="space-y-1">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Button variant="ghost" className="w-full justify-start text-white/85 hover:bg-white/10">
                          <div className="w-6 h-6 bg-cyan-500 text-neutral-900 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                            {child.name.charAt(0)}
                          </div>
                          <span>{child.name} {child.surname}</span>
                        </Button>
                      </li>
                    ))}
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-cyan-300 hover:text-white hover:bg-white/10">
                        <FaChild className="mr-3" />
                        Dodaj dziecko
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.aside>

            {/* main */}
            <div className="flex-1 space-y-8">
              {/* ===== OVERVIEW ===== */}
              <TabsContent value="overview" className="mt-0">
                <motion.div {...fadeUp(0.05)}>
                  <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">Witaj ponownie, {userData?.name}!</h2>
                          <p className="text-white/70">Szybki przegląd postępów i terminów Twoich dzieci.</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Zobacz harmonogram
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* dzieci — skróty */}
                <motion.div {...fadeUp(0.08)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {children.map((child) => {
                    const childClasses = classes.filter((c) => c.childId === child.id);
                    const activeClasses = childClasses.filter((c) => c.status === "Active");
                    const next = activeClasses
                      .map((c) => ({ c, d: c.nextClassISO ? new Date(c.nextClassISO) : null }))
                      .filter((x) => x.d && !isNaN(x.d.getTime()))
                      .sort((a, b) => a.d!.getTime() - b.d!.getTime())[0];

                    const avgAttendance =
                      activeClasses.length > 0
                        ? activeClasses.reduce((sum, c) => sum + c.attendance, 0) / activeClasses.length
                        : 0;

                    return (
                      <Card key={child.id} className="overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-cyan-500 text-neutral-900 rounded-full flex items-center justify-center font-bold mr-4 text-lg">
                                  {child.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{child.name} {child.surname}</h3>
                                  <p className="text-white/70 text-sm">Wiek: {child.age}</p>
                                </div>
                              </div>
                              <Button variant="ghost" className="text-cyan-300 hover:bg-white/10 text-sm">
                                Szczegóły
                              </Button>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Aktywne zajęcia</h4>
                              {activeClasses.length > 0 ? (
                                activeClasses.map((c) => (
                                  <div key={c.id} className="bg-neutral-900/40 border border-white/10 p-3 rounded-md mb-2 last:mb-0">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{c.className}</p>
                                        <p className="text-sm text-white/70">{c.schedule}</p>
                                      </div>
                                      <span className="bg-emerald-500/15 text-emerald-300 text-xs px-2 py-1 rounded-full">
                                        {c.status}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-neutral-900/40 border border-white/10 p-3 rounded-md">
                                  <p className="text-white/70 text-center">Brak aktywnych zajęć</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Frekwencja</h4>
                              <div className="flex items-center">
                                <div className="w-full bg-white/10 rounded-full h-3">
                                  <div
                                    className="bg-cyan-400 h-3 rounded-full"
                                    style={{ width: `${avgAttendance}%` }}
                                  />
                                </div>
                                <span className="ml-3 text-sm font-medium">{avgAttendance.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="px-6 py-3 border-t border-white/10 bg-neutral-900/40">
                            <div className="flex justify-between items-center text-white/85">
                              <div className="text-sm">
                                {next?.d ? (
                                  <>
                                    <span className="font-medium text-white">Najbliższe zajęcia:</span>{" "}
                                    {next.d.toLocaleDateString("pl-PL", {
                                      weekday: "long",
                                      day: "2-digit",
                                      month: "long",
                                    })}{" "}
                                    •{" "}
                                    {next.d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                                  </>
                                ) : (
                                  <span>Brak nadchodzących terminów</span>
                                )}
                              </div>
                              <Button variant="ghost" className="text-cyan-300 hover:bg-white/10 text-sm">
                                Zapisz na zajęcia
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>

                {/* harmonogram skrót */}
                <motion.div {...fadeUp(0.1)}>
                  <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
                    <CardHeader>
                      <CardTitle>Najbliższy harmonogram</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingClasses.length > 0 ? (
                          upcomingClasses.map((item, idx) => {
                            const dt = item._dt!;
                            return (
                              <div key={item.id} className={`border-l-4 pl-4 ${idx === 0 ? "border-cyan-400" : "border-white/20"}`}>
                                <h4 className="font-medium mb-2">
                                  {dt.toLocaleDateString("pl-PL", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                  })}
                                </h4>
                                <div className="bg-neutral-900/40 border border-white/10 p-3 rounded-md">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium">{item.className}</span>
                                        <span className="ml-2 text-xs bg-cyan-500/15 text-cyan-300 px-2 py-1 rounded-full">
                                          {item.childName}
                                        </span>
                                      </div>
                                      <p className="text-sm text-white/70">
                                        {dt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} • {item.location}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10">
                                      <span className="sr-only">Akcje</span>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-white/70">Brak zaplanowanych terminów</div>
                        )}
                      </div>

                      <div className="mt-6 text-center">
                        <Button variant="ghost" className="text-cyan-300 hover:bg-white/10 inline-flex items-center">
                          Pełny kalendarz
                          <FaCalendarAlt className="ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* płatności skrót */}
                <motion.div {...fadeUp(0.12)}>
                  <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Płatności</CardTitle>
                      <Button variant="ghost" className="text-cyan-300 hover:bg-white/10 text-sm">
                        Zobacz wszystkie
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-left text-xs uppercase text-white/60">
                              <th className="px-6 py-3">Opis</th>
                              <th className="px-6 py-3">Uczeń</th>
                              <th className="px-6 py-3">Data</th>
                              <th className="px-6 py-3">Kwota</th>
                              <th className="px-6 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {payments.map((p) => {
                              const status = p.status.toLowerCase();
                              const chip =
                                status === "paid"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-amber-500/15 text-amber-300";
                              return (
                                <tr key={p.id}>
                                  <td className="px-6 py-3">{p.description}</td>
                                  <td className="px-6 py-3 text-white/80">{p.studentName}</td>
                                  <td className="px-6 py-3 text-white/70">{p.date}</td>
                                  <td className="px-6 py-3 font-medium">{formatPLN(p.amount)}</td>
                                  <td className="px-6 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${chip}`}>
                                      {status === "paid" ? "Opłacone" : "Do zapłaty"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {outstandingPayment && (
                        <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
                          <div className="text-white/80">
                            Saldo do zapłaty:{" "}
                            <span className="font-bold text-white">{formatPLN(outstandingPayment.amount)}</span>
                          </div>
                          <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                            Opłać teraz
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* ===== CLASSES ===== */}
              <TabsContent value="classes" className="mt-0">
                <motion.div {...fadeUp(0.05)}>
                  <ClassRegistration children={children} classes={classes} />
                </motion.div>
              </TabsContent>

              {/* ===== PAYMENTS ===== */}
              <TabsContent value="payments" className="mt-0">
                <motion.div {...fadeUp(0.05)}>
                  <PaymentHistory payments={payments} />
                </motion.div>
              </TabsContent>

              {/* ===== SETTINGS ===== */}
              <TabsContent value="settings" className="mt-0">
                <motion.div {...fadeUp(0.05)}>
                  <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
                    <CardHeader>
                      <CardTitle>Ustawienia konta</CardTitle>
                      <CardDescription className="text-white/70">
                        Zarządzaj danymi konta i dziećmi
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <ChildrenManager children={children} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ParentDashboardPage;
