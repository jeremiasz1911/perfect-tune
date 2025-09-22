import React, { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  DocumentReference,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AddLessonForm } from "../AddLessonForm";
import { WeeklyCalendar } from "../WeeklyCalendar";
import {
  FaPlus,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaUserAlt,
  FaClock
} from "react-icons/fa";
import type { LessonData } from "@/lib/types";

interface UserData {
  id: string;
  name: string;
  surname: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  instructor: string;
  participants: string[];
}

// Helper: get Monday of the week containing `d`
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

const fmt = (d: Date) =>
  String(d.getDate()).padStart(2, "0") +
  "." +
  String(d.getMonth() + 1).padStart(2, "0");

export default function LessonManager() {
  const { toast } = useToast();

  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string|null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData|null>(null);
  const [childrenList, setChildrenList] = useState<UserData[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [participants, setParticipants] = useState<UserData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "instrument" | "vocal" | "theory" | "ensemble"
  >("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">(
    "all"
  );

  // ✅ Pobieranie listy dzieci dla wybranej lekcji
 useEffect(() => {
  if (!selectedLesson?.id) { setParticipants([]); return; }

  (async () => {
    try {
      const ACTIVE = ["active", "approved", "ongoing"]; // dopasuj do swoich nazw
      const enrSnap = await getDocs(
        query(
          collection(db, "enrollments"),
          where("classId", "==", selectedLesson.id),
          where("status", "in", ACTIVE)
        )
      );

      const childIds = Array.from(new Set(
        enrSnap.docs.map(d => (d.data() as any).childId).filter(Boolean)
      ));

      const users = await Promise.all(
        childIds.map(async (id) => {
          const s = await getDoc(doc(db, "children", id));
          return s.exists() ? ({ id, ...(s.data() as any) }) : null;
        })
      );

      setParticipants(users.filter(Boolean) as UserData[]);
    } catch (error) {
      console.error("Roster fetch error:", error);
      setParticipants([]);
    }
  })();
}, [selectedLesson?.id]);



  // ✅ Pobieranie lekcji z Firestore
  const fetchLessons = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "lessons"));
      const arr: LessonData[] = [];
      snap.docs.forEach((d) => {
        const data = d.data() as LessonData;
        arr.push({ ...data, id: d.id });
      });
      setLessons(arr);
    } catch (e) {
      console.error(e);
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać lekcji.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    if (!selectedLessonId) return;
    (async () => {
      const snap = await getDoc(doc(db, "lessons", selectedLessonId));
      setSelectedLesson(snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null);
    })();
  }, [selectedLessonId]);

  // ✅ Usuwanie lekcji
  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę lekcję?")) return;
    try {
      await deleteDoc(doc(db, "lessons", id));
      toast({ title: "Usunięto", description: "Lekcja usunięta." });
      setSelectedLesson(null);
      fetchLessons();
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć.",
        variant: "destructive",
      });
    }
  };

  // ✅ Generowanie tygodniowych wydarzeń
  const weeklyEvents = React.useMemo(() => {
    const monday = getMonday(weekStart);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    const dayNames = [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ];

    const evts: EventItem[] = [];
    for (const lesson of lessons) {
      const sched = lesson.schedule as any;
      const { days = [], frequency, startDate, endDate } = sched;
      const startDateObj = startDate.toDate();
      const endDateObj = endDate?.toDate();
      const SEP = "__@__"; // coś, co na pewno nie wystąpi w ID

      weekDates.forEach((d) => {
        if (!days.includes(dayNames[d.getDay()])) return;
        if (d < startDateObj) return;
        if (endDateObj && d > endDateObj) return;
        if (frequency === "biweekly") {
          const diffMs = d.valueOf() - startDateObj.valueOf();
          const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
          if (weeks % 2 !== 0) return;
        }
        if (frequency === "monthly" && d.getDate() !== startDateObj.getDate()) {
          return;
        }

        evts.push({
          id: `${lesson.id}${SEP}${d.toISOString().slice(0,10)}`, // unikalny klucz i eventId
          title: lesson.title,
          date: d,
          time: `${sched.startTime} - ${sched.endTime}`,
          location: lesson.location,
          instructor: lesson.instructor,
          participants: (lesson.participants || []).map((r: DocumentReference) => r.id),
        });

      });
    }
    return evts;
  }, [lessons, weekStart]);

  const prevWeek = () =>
    setWeekStart((ws) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() - 7));
  const nextWeek = () =>
    setWeekStart((ws) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 7));

  return (
    <div className="space-y-6 ">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-10 bg-white p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={prevWeek}>
            &larr;
          </Button>
          <span className="font-semibold">
            {fmt(weekStart)} – {fmt(new Date(weekStart.valueOf() + 6 * 86400000))}
          </span>
          <Button variant="outline" onClick={nextWeek}>
            &rarr;
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="instrument">Instrument</SelectItem>
              <SelectItem value="vocal">Wokal</SelectItem>
              <SelectItem value="theory">Teoria</SelectItem>
              <SelectItem value="ensemble">Ensemble</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <FaCalendarAlt className="mr-2" />
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="upcoming">Nadchodzące</SelectItem>
              <SelectItem value="past">Zakończone</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)}>
            <FaPlus className="mr-1" /> Dodaj
          </Button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Tygodnia</CardTitle>
          <CardDescription>
            Kliknij wydarzenie, by zobaczyć szczegóły
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <WeeklyCalendar
            events={weeklyEvents}
            weekStart={weekStart}
            onSelect={async (eventId) => {
              const [lessonId] = eventId.split("__@__");
              setSelectedLessonId(lessonId);      // tylko ID
            }}
            onEdit={(eventId) => {
              const [lessonId] = eventId.split("__@__");
              const l = lessons.find((x) => x.id === lessonId);
              if (l) {
                setEditingLesson(l);
                setIsEditOpen(true);
              }
            }}
            onDelete={(eventId) => {
              const [lessonId] = eventId.split("__@__");
              handleDelete(lessonId);
            }}
          />

        </CardContent>
      </Card>

      {/* Add / Edit */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh]">

          <DialogHeader className="relative">
            <DialogTitle className="relative top-4 left-4">Dodaj lekcję</DialogTitle>
          </DialogHeader>
          <AddLessonForm
            onSuccess={() => {
              setIsAddOpen(false);
              fetchLessons();
            }}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh]">

          <DialogHeader>
            <DialogTitle>Edytuj lekcję</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <AddLessonForm
              initialData={editingLesson}
              onCancel={() => setIsEditOpen(false)}
              onSuccess={(updatedLesson) => {
                setIsEditOpen(false);
                if (updatedLesson) {
                  // podmień w liście
                  setLessons(prev =>
                    prev.some(l => l.id === updatedLesson.id)
                      ? prev.map(l => (l.id === updatedLesson.id ? updatedLesson : l))
                      : [updatedLesson, ...prev] // na wszelki wypadek gdyby to był "add"
                  );
                  // jeśli szczegóły są otwarte dla tej lekcji – zaktualizuj je też
                  setSelectedLesson(sl => (sl?.id === updatedLesson.id ? updatedLesson : sl));
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Details */}
      <Dialog open={!!selectedLesson} onOpenChange={() => {
        setSelectedLesson(null);
        setSelectedLessonId(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Szczegóły Lekcji</DialogTitle>
            <DialogDescription>Informacje i uczestnicy</DialogDescription>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4">
              <Card className="bg-indigo-50">
                <CardHeader>
                  <CardTitle>{selectedLesson.title}</CardTitle>
                  <CardDescription className="uppercase text-sm">
                    {selectedLesson.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <FaCalendarAlt className="inline mr-1" />{" "}
                    {selectedLesson.schedule.startDate
                      .toDate()
                      .toLocaleDateString()}
                  </p>
                  <p>
                    <FaClock className="inline mr-1" />{" "}
                    {selectedLesson.schedule.startTime} –{" "}
                    {selectedLesson.schedule.endTime}
                  </p>
                  <p>
                    <FaUserAlt className="inline mr-1" /> Pojemność:{" "}
                    {selectedLesson.capacity}
                  </p>
                </CardContent>
              </Card>
              <div>
                <h4 className="font-semibold">Lokalizacja:</h4>
                <p>{selectedLesson.location}</p>

                <h3 className="font-semibold mt-3">Lista uczestników:</h3>
                <ul>
                
                  {participants.length > 0 ? (
                    participants.map((child) => (
                      <li key={child.id}>
                        {child.name} {child.surname}
                      </li>
                    ))
                  ) : (
                    <li>Brak zapisanych dzieci.</li>
                  )}
                
                </ul>
              </div>
              <DialogFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingLesson(selectedLesson);
                    setIsEditOpen(true);
                  }}
                >
                  <FaEdit className="mr-1" /> Edytuj
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedLesson.id!)}
                >
                  <FaTrash className="mr-1" /> Usuń
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
