import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, Timestamp,
  query, where, writeBatch, serverTimestamp   
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { EnhancedChildrenSelector, IChild } from "./EnhancedChildrenSelector";
import type { LessonData } from "@/lib/types";

interface AddLessonFormProps {
  onSuccess: (lesson?: LessonData) => void;
  onCancel: () => void;
  initialData?: LessonData;
}

const daysOfWeek = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

const frequencies = [
  { value: "weekly", label: "Co tydzień" },
  { value: "biweekly", label: "Co dwa tygodnie" },
  { value: "monthly", label: "Co miesiąc" },
];

const toTimestamp = (dateStr: string): Timestamp | null =>
  dateStr ? Timestamp.fromDate(new Date(dateStr)) : null;

export const AddLessonForm = ({
  onSuccess,
  onCancel,
  initialData,
}: AddLessonFormProps) => {
  const { toast } = useToast();
  const isEdit = Boolean(initialData?.id);
  const [submitting, setSubmitting] = useState(false);

  // --- Formularz ---
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"instrument" | "vocal" | "theory" | "ensemble">("instrument");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [frequency, setFrequency] = useState<LessonData["schedule"]["frequency"]>("weekly");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [ageRange, setAgeRange] = useState("");

  // billing
  const [billingModel, setBillingModel] = useState<"monthly" | "per_lesson">("monthly");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [pricePerLesson, setPricePerLesson] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [dueDays, setDueDays] = useState("7");
  const [proration, setProration] = useState(true);

  // --- Children selector state ---
  const [groupedByGroup, setGroupedByGroup] = useState<Record<string, IChild[]>>({});
  const [groupedByParent, setGroupedByParent] = useState<Record<string, IChild[]>>({});
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  async function syncEnrollmentsForLesson(lessonId: string, nextChildIds: string[]) {
    // 1) Aktywne/obowiązujące statusy – dostosuj nazwy do swoich
    const activeStatuses = ["active", "approved", "ongoing"];

    const curSnap = await getDocs(
      query(
        collection(db, "enrollments"),
        where("classId", "==", lessonId),
        where("status", "in", activeStatuses)
      )
    );

    // childId -> {id, ...data}
    const current = new Map<string, { id: string; data: any }>(
      curSnap.docs.map((d) => [ (d.data() as any).childId, { id: d.id, data: d.data() } ])
    );

    const nextSet = new Set(nextChildIds);

    const toAdd = nextChildIds.filter((id) => !current.has(id));
    const toDeactivate = [...current.keys()].filter((id) => !nextSet.has(id));

    // 2) Zbierz parentId dla dodawanych dzieci (jeśli potrzebujesz w enrollment)
    const parentsByChild = new Map<string, string | null>();
    await Promise.all(
      toAdd.map(async (childId) => {
        try {
          const cSnap = await getDoc(doc(db, "children", childId));
          parentsByChild.set(childId, cSnap.exists() ? ((cSnap.data() as any)?.parentId ?? null) : null);
        } catch {
          parentsByChild.set(childId, null);
        }
      })
    );

    // 3) Batch
    const batch = writeBatch(db);
    const now = serverTimestamp();

    // Dodaj brakujących
    for (const childId of toAdd) {
      const newRef = doc(collection(db, "enrollments"));
      batch.set(newRef, {
        classId: lessonId,
        childId,
        parentId: parentsByChild.get(childId) ?? null,
        status: "active",          // albo "approved" – jak w Twojej logice
        startedAt: now,
        createdAt: now,
        createdBy: "admin_form",   // opcjonalnie meta
      });
    }

    // Dezaktywuj usuniętych
    for (const childId of toDeactivate) {
      const enrId = current.get(childId)!.id;
      const ref = doc(db, "enrollments", enrId);
      batch.update(ref, {
        status: "inactive",
        endedAt: now,
        updatedAt: now,
        endedReason: "removed_in_lesson_form", // opcjonalnie meta
      });
    }

    await batch.commit();
  }


  // Init from initialData
  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title || "");
    setType((initialData.type as any) || "instrument");
    setDescription(initialData.description || "");
    setInstructor(initialData.instructor || "");
    setDays(initialData.schedule?.days || []);
    setStartDate(initialData.schedule?.startDate?.toDate()?.toISOString().slice(0, 10) || "");
    setEndDate(initialData.schedule?.endDate?.toDate()?.toISOString().slice(0, 10) || "");
    setStartTime(initialData.schedule?.startTime || "");
    setEndTime(initialData.schedule?.endTime || "");
    setFrequency(initialData.schedule?.frequency || "weekly");
    setLocation(initialData.location || "");
    setCapacity(initialData.capacity?.toString() || "");
    setAgeRange(initialData.ageRange || "");
    setSelectedChildren(initialData.participants?.map((ref: any) => ref.id) || []);

    const b = (initialData as any).billing || {};
    setBillingModel(b.model ?? "monthly");
    setPriceMonthly(String(b.priceMonthly ?? ""));
    setPricePerLesson(String(b.pricePerLesson ?? ""));
    setBillingDay(String(b.billingDay ?? 1));
    setDueDays(String(b.dueDays ?? 7));
    setProration(Boolean(b.proration ?? true));
  }, [initialData]);

  // Fix participants IDs also when references come as paths
 useEffect(() => {
  if (!isEdit || !initialData?.id) return;

  (async () => {
    try {
      const enrSnap = await getDocs(
        query(
          collection(db, "enrollments"),
          where("classId", "==", initialData.id),
          where("status", "in", ["active", "approved", "ongoing"])
        )
      );
      const ids = Array.from(
        new Set(
          enrSnap.docs.map((d) => (d.data() as any)?.childId).filter(Boolean)
        )
      );
      // Nadpisz selekcję w formularzu – to zobaczysz w selektorze
      setSelectedChildren(ids);
    } catch (e) {
      console.warn("Nie udało się pobrać aktywnych enrollmentów:", e);
      // w razie błędu zostanie fallback z initialData.participants
    }
  })();
}, [isEdit, initialData?.id]);

  

  // Load children + groups
  useEffect(() => {
    (async () => {
      try {
        const [groupSnap, childSnap] = await Promise.all([
          getDocs(collection(db, "groups")),
          getDocs(collection(db, "children")),
        ]);
        const groups = groupSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

        const byGroup: Record<string, IChild[]> = {};
        const byParent: Record<string, IChild[]> = {};

        for (const docSnap of childSnap.docs) {
          const data: any = docSnap.data();
          const groupObj = groups.find(
            (g) => Array.isArray(g.children) && g.children.includes(docSnap.id)
          );
          const groupName = groupObj?.name || "Brak grupy";

          // parent
          let parentName = "Bez rodzica";
          if (data.parentId) {
            try {
              const pSnap = await getDoc(doc(db, "users", data.parentId));
              if (pSnap.exists()) {
                const pd = pSnap.data() as any;
                parentName = `${pd.name} ${pd.surname}`;
              }
            } catch {}
          }

          const child: IChild = {
            id: docSnap.id,
            name: data.name,
            surname: data.surname,
            group: groupName,
          };

          byGroup[groupName] = [...(byGroup[groupName] || []), child];
          byParent[parentName] = [...(byParent[parentName] || []), child];
        }

        // Sort children
        Object.keys(byGroup).forEach((key) => {
          byGroup[key].sort((a, b) => a.name.localeCompare(b.name));
        });
        Object.keys(byParent).forEach((key) => {
          byParent[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        setGroupedByGroup(byGroup);
        setGroupedByParent(byParent);
      } catch (err) {
        console.error(err);
        toast({
          title: "Błąd",
          description: "Nie udało się wczytać grup/dzieci.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm("Na pewno usunąć tę lekcję?")) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, "lessons", initialData.id));
      toast({ title: "Usunięto", description: "Lekcja została usunięta." });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({ title: "Błąd", description: "Nie udało się usunąć lekcji.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // helpery
const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const compact = <T extends Record<string, any>>(obj: T): T => {
  const out: any = {};
  Object.keys(obj).forEach((k) => {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
};

const handleSubmit = async () => {
  console.log("DEBUG [Submit] Selected children before save:", selectedChildren);

  if (!title || !startDate || !startTime) {
    toast({ title: "Błąd", description: "Wypełnij pola oznaczone *.", variant: "destructive" });
    return;
  }
  if (days.length === 0) {
    toast({ title: "Błąd", description: "Zaznacz przynajmniej jeden dzień tygodnia.", variant: "destructive" });
    return;
  }

  setSubmitting(true);
  try {
    // --- schedule (bez undefined) ---
    const schedule = compact({
      date: Timestamp.fromDate(new Date(startDate)),
      startDate: Timestamp.fromDate(new Date(startDate)),
      startTime,
      endTime: endTime || undefined,
      days,
      frequency,
      endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : undefined,
    });

    // --- billing (bez undefined, tylko pola dla danego modelu) ---
    const billing =
      billingModel === "monthly"
        ? compact({
            model: "monthly",
            priceMonthly: num(priceMonthly) ?? 0,
            billingDay: Math.min(28, Math.max(1, num(billingDay) ?? 1)),
            dueDays: num(dueDays) ?? 7,
            proration: !!proration,
          })
        : compact({
            model: "per_lesson",
            pricePerLesson: num(pricePerLesson) ?? 0,
            dueDays: num(dueDays) ?? 7,
          });

    // --- participants jako DocumentReference[] (bez rekursji) ---
    const participants = selectedChildren
      .map((id) => id.split("-new-")[0])
      .filter(Boolean)
      .map((cleanId) => doc(db, "children", cleanId));

    // --- payload (płytkie czyszczenie, żadnej rekursji po ref/timestamp) ---
    const payload = compact({
      title,
      type,
      description,
      instructor,
      schedule,
      location,
      participants,
      capacity: num(capacity),
      ageRange,
      currency: "PLN",
      billing,
      updatedAt: Timestamp.now(),
      // jeśli chcesz zostawić ogólne "price"
      //price: num(price),
    });

    if (isEdit && initialData?.id) {
      await updateDoc(doc(db, "lessons", initialData.id), payload);

      // ⬇️ DOPISZ: synchronizacja enrollments do wybranych dzieci
      await syncEnrollmentsForLesson(initialData.id, selectedChildren);

      toast({ title: "Sukces", description: "Lekcja zaktualizowana." });
      onSuccess({ ...(initialData as any), ...payload, id: initialData.id });
    } else {
      const ref = await addDoc(collection(db, "lessons"), {
        ...payload,
        createdAt: Timestamp.now(),
      });

      // (opcjonalnie) od razu załóż enrollments zgodne z wybraną listą:
      await syncEnrollmentsForLesson(ref.id, selectedChildren);

      toast({ title: "Sukces", description: "Nowa lekcja utworzona." });
      onSuccess({ ...(payload as any), id: ref.id });
    }

  } catch (err) {
    console.error("DEBUG [Submit] Error saving lesson:", err);
    toast({ title: "Błąd", description: "Nie udało się zapisać lekcji.", variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="flex flex-col max-h-[80vh]">
      {/* Scrollowalna zawartość */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6">
        <div className="space-y-1 text-center">
          <div className="text-lg font-semibold">{isEdit ? "Edytuj lekcję" : "Nowa lekcja"}</div>
          <p className="text-sm text-muted-foreground">Uzupełnij podstawowe informacje i harmonogram.</p>
        </div>

        {/* SEKCJA: Podstawowe */}
        <section className="space-y-4">
          <h4 className="font-medium text-base">Podstawowe</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lesson-title">Nazwa lekcji*</Label>
              <Input id="lesson-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="lesson-type">Typ lekcji</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger id="lesson-type">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instrument">Instrument</SelectItem>
                  <SelectItem value="vocal">Wokal</SelectItem>
                  <SelectItem value="theory">Teoria</SelectItem>
                  <SelectItem value="ensemble">Zespół</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lesson-instructor">Prowadzący</Label>
              <Select value={instructor} onValueChange={setInstructor}>
                <SelectTrigger id="lesson-instructor">
                  <SelectValue placeholder="Wybierz prowadzącego" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jan Kowalski">Jan Kowalski</SelectItem>
                  <SelectItem value="Anna Nowak">Anna Nowak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="lesson-description">Opis</Label>
            <Textarea
              id="lesson-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Krótki opis zajęć…"
            />
          </div>
        </section>

        <Separator />

        {/* SEKCJA: Harmonogram */}
        <section className="space-y-4">
          <h4 className="font-medium text-base">Harmonogram</h4>

          <div>
            <Label>Dni tygodnia*</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-2">
              {daysOfWeek.map((d) => {
                const active = days.includes(d);
                return (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => toggleDay(d)}
                    className="justify-center"
                  >
                    {d}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data rozpoczęcia*</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Data zakończenia</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Godzina rozpoczęcia*</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>Godzina zakończenia</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div>
              <Label>Częstotliwość</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz częstotliwość" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator />

        {/* SEKCJA: Organizacja */}
        <section className="space-y-4">
          <h4 className="font-medium text-base">Organizacja</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Lokalizacja</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label>Pojemność</Label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="np. 8"
              />
            </div>
            <div>
              <Label>Przedział wiekowy</Label>
              <Input value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="np. 7–12" />
            </div>
          </div>
        </section>

        <Separator />

        {/* SEKCJA: Rozliczenia */}
        <section className="space-y-4">
          <h4 className="font-medium text-base">Rozliczenia</h4>

          {/* Segmented radio: monthly vs per_lesson */}
          <RadioGroup
            value={billingModel}
            onValueChange={(v) => setBillingModel(v as any)}
            className="grid grid-cols-2 gap-2 w-full md:w-[420px]"
          >
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${billingModel === "monthly" ? "border-primary ring-1 ring-primary" : "border-muted"}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="monthly" id="billing-monthly" />
                <Label htmlFor="billing-monthly" className="cursor-pointer">
                  Płatność miesięczna
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">stała stawka</span>
            </div>

            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${billingModel === "per_lesson" ? "border-primary ring-1 ring-primary" : "border-muted"}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="per_lesson" id="billing-perlesson" />
                <Label htmlFor="billing-perlesson" className="cursor-pointer">
                  Za pojedyncze zajęcia
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">płacisz za obecność</span>
            </div>
          </RadioGroup>

          {/* Pola zależne od modelu */}
          {billingModel === "monthly" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Kwota miesięczna (PLN)*</Label>
                <Input
                  type="number"
                  min={0}
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(e.target.value)}
                  placeholder="np. 120"
                />
              </div>
              <div>
                <Label>Dzień rozliczenia</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  placeholder="1–28"
                />
              </div>
              <div>
                <Label>Termin płatności (dni)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={dueDays}
                  onChange={(e) => setDueDays(e.target.value)}
                  placeholder="np. 7"
                />
              </div>
              <div className="flex items-center gap-3 md:col-span-3">
                <Switch id="proration" checked={proration} onCheckedChange={setProration} />
                <Label htmlFor="proration">Naliczenie proporcjonalne w 1. miesiącu</Label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label>Kwota za zajęcia (PLN)*</Label>
                <Input
                  type="number"
                  min={0}
                  value={pricePerLesson}
                  onChange={(e) => setPricePerLesson(e.target.value)}
                  placeholder="np. 40"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Termin płatności (dni)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={dueDays}
                  onChange={(e) => setDueDays(e.target.value)}
                  placeholder="np. 7"
                />
              </div>
            </div>
          )}
        </section>

        <Separator />

        {/* SEKCJA: Uczestnicy */}
        <section className="space-y-3">
          <h4 className="font-medium text-base">Uczestnicy</h4>
          <EnhancedChildrenSelector
            groupedByGroup={groupedByGroup}
            groupedByParent={groupedByParent}
            selected={selectedChildren}
            onChange={setSelectedChildren}
          />
        </section>
      </div>

      {/* Sticky footer (akcje) */}
      <div className=" bottom-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 md:px-6 py-3 flex justify-end gap-2">
        {isEdit && (
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            Usuń
          </Button>
        )}
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Anuluj
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (isEdit ? "Aktualizuję..." : "Tworzę...") : isEdit ? "Aktualizuj lekcję" : "Utwórz lekcję"}
        </Button>
      </div>
    </div>
  );
};

export default AddLessonForm;
