import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FaPlus, FaEdit, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaRegUser, FaMusic } from "react-icons/fa";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import AddActivityForm from "./AddActivityForm";

interface UserData {
  id: string;
  name?: string;
  surname?: string;
}

interface EventItem {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: "class" | "workshop" | "performance" | "meeting";
  instructor: string;
  childrens?: string[] | number;
}

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredStudentDetails, setRegisteredStudentDetails] = useState<UserData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEventData, setEditingEventData] = useState<any>(null);

  const { toast } = useToast();

  // 1) Pobieramy lekcje
  const fetchEvents = useCallback(async () => {
    try {
      const lessonsSnapshot = await getDocs(collection(db, "lessons"));

      // Zbuduj eventy + roster z enrollments (status in ["active","approved","ongoing"])
      const lessonEvents: EventItem[] = await Promise.all(
        lessonsSnapshot.docs.map(async (docSnap) => {
          const data: any = docSnap.data();

          const eventDate =
            data?.schedule?.date?.toDate
              ? data.schedule.date.toDate()
              : new Date(data?.schedule?.date);

          // ⬇️ TU: roster z enrollments
          const enrSnap = await getDocs(
            query(
              collection(db, "enrollments"),
              where("classId", "==", docSnap.id),
              where("status", "in", ["active", "approved", "ongoing"])
            )
          );
          const activeChildIds = Array.from(
            new Set(
              enrSnap.docs
                .map((d) => (d.data() as any)?.childId)
                .filter(Boolean)
            )
          );

          return {
            id: docSnap.id,
            title: data?.title ?? data?.name ?? "Untitled",
            date: eventDate,
            time: `${data?.schedule?.startTime ?? "N/A"} - ${data?.schedule?.endTime ?? "N/A"}`,
            location: data?.location ?? "",
            type: "class",
            instructor: data?.instructor ?? "",
            // ⬇️ już nie z lessons.participants
            childrens: activeChildIds, // string[]
          };
        })
      );

      setEvents(lessonEvents);
    } catch (error) {
      console.error("Error loading events from Firestore:", error);
      toast({ title: "Błąd", description: "Nie udało się wczytać wydarzeń.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 2) Po wyborze eventu pobieramy listę dzieci (jeżeli to tablica ID)
  useEffect(() => {
    setRegisteredStudentDetails([]);
    if (selectedEvent && Array.isArray(selectedEvent.childrens) && selectedEvent.childrens.length > 0) {
      fetchStudentDetails(selectedEvent.childrens);
    }
  }, [selectedEvent]);

  const fetchStudentDetails = async (studentIds: string[]) => {
    try {
      const uniqueIds = Array.from(new Set(studentIds));
      const childrensData = await Promise.all(
        uniqueIds.map(async (id) => {
          const snap = await getDoc(doc(db, "children", id));
          return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as UserData) : null;
        })
      );
      setRegisteredStudentDetails(childrensData.filter(Boolean) as UserData[]);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  // 3) Filtrowanie po wybranym dniu
  const filteredEvents = events.filter(
    (event) =>
      selectedDate &&
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
  );

  const handleDateSelect = (date: Date | undefined) => setSelectedDate(date);

  // 4) Klik w kartę eventu → otwarcie szczegółów + zaciągnięcie danych do edycji
  const handleEventClick = async (event: EventItem) => {
    setSelectedEvent(event);

    const col = event.type === "workshop" ? "workshops" : "lessons";
    const snap = await getDoc(doc(db, col, event.id));
    if (snap.exists()) {
      const data = snap.data() as any;

      // Zamiast rozbijać na pojedyncze pola — przekaż całość do AddActivityForm:
      setEditingEventData({
        id: event.id,
        ...data,
        title: data.title ?? data.name, // fallback nazwy
      });
    }

    setShowEventDetailsDialog(true);
  };

  const getEventBadgeVariant = (type: EventItem["type"]) => {
    switch (type) {
      case "class":
        return "default";
      case "workshop":
        return "secondary";
      case "performance":
        return "outline";
      case "meeting":
        return "destructive";
      default:
        return "default";
    }
  };

  // Liczba zapisanych (obsługa tablica/number)
  const getSignedCount = (childrens?: string[] | number) =>
    Array.isArray(childrens) ? childrens.length : Number(childrens ?? 0);

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-neutral-500">Manage classes, workshops and events</p>
        </div>

        {/* Użyj tego samego modala do dodawania i edycji */}
        <Button
          onClick={() => {
            setEditingEventData(null); // create mode
            setShowEditDialog(true);
          }}
          className="flex items-center gap-2"
        >
          <FaPlus size={14} />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Lewy kalendarz + lista eventów */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border rounded-md p-4"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Workshops</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Performances</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Meetings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate &&
                `Events for ${selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FaMusic className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaUsers className="h-3 w-3" />
                              <span>{event.instructor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getEventBadgeVariant(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaCalendarAlt className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No events scheduled</h3>
                <p className="text-neutral-500 mt-1 max-w-md">
                  There are no events scheduled for this date. Click the "Add Event" button to create a new event.
                </p>
                <Button
                  onClick={() => {
                    setEditingEventData(null);
                    setShowEditDialog(true);
                  }}
                  className="mt-4"
                >
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jeden modal: Add + Edit */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingEventData ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>

          <AddActivityForm
            initialData={editingEventData}
            onSuccess={() => {
              setShowEditDialog(false);
              fetchEvents();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal szczegółów eventu */}
      <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <Badge variant={getEventBadgeVariant(selectedEvent.type)}>
                  {selectedEvent.type}
                </Badge>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center text-neutral-700">
                  <FaCalendarAlt className="mr-2" />
                  <span>{selectedEvent.date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaClock className="mr-2" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <FaUsers className="mr-2" />
                  <span>Instructor: {selectedEvent.instructor}</span>
                </div>

                {selectedEvent.childrens !== undefined && (
                  <div className="items-center text-neutral-700">
                    <div className="flex items-center">
                      <FaUsers className="mr-2" />
                      <span>{getSignedCount(selectedEvent.childrens)} zapisanych dzieci</span>
                    </div>

                    {Array.isArray(selectedEvent.childrens) && registeredStudentDetails.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold pb-4">Zarejestrowane dzieci:</h4>
                        <ul>
                          {registeredStudentDetails.map((student) => (
                            <li className="flex pb-2 rounded-md" key={student?.id}>
                              <FaRegUser className="mr-2 mt-1" />
                              {student?.name} {student?.surname}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowEventDetailsDialog(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowEventDetailsDialog(false);
                setShowEditDialog(true);
              }}
            >
              <FaEdit className="mr-1" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
