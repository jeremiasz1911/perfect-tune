import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { EnhancedChildrenSelector} from "./EnhancedChildrenSelector";

// ----------------------
// Typy
// ----------------------

interface GroupData {
  id: string;
  name: string;
  description?: string;
  children: string[];
}

interface IChild {
  id: string;
  name: string;
  surname?: string;
  group?: string;
}

interface AddActivityFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
    type: "class" | "workshop";
    title: string;
    description: string;
    location: string;
    price: number;
    date: string;
    startTime: string;
    endTime: string;
    instructor?: string;
    days?: string;
    capacity?: number;
    ageRange?: string;
    category?: string;
    imageUrl?: string;
    spotsLeft?: number;
    children?: string[];
  };
}

// ----------------------
// Helpers
// ----------------------

const combineDateTime = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}:00`);
};

// ----------------------
// Komponent
// ----------------------

export default function AddActivityForm({
  onSuccess,
  initialData,
}: AddActivityFormProps) {
  const { toast } = useToast();
  const isEdit = Boolean(initialData);

  // Typ eventu
  const [eventType, setEventType] = useState<"class" | "workshop">(
    initialData?.type ?? "class"
  );

  // Wspólne pola
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [date, setDate] = useState(initialData?.date ?? "");
  const [startTime, setStartTime] = useState(initialData?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialData?.endTime ?? "");

  // Klasy
  const [instructor, setInstructor] = useState(initialData?.instructor ?? "");
  const [days, setDays] = useState(initialData?.days ?? "");
  const [capacity, setCapacity] = useState(initialData?.capacity ?? 0);
  const [ageRange, setAgeRange] = useState(initialData?.ageRange ?? "");

  // Warsztaty
  const [category, setCategory] = useState(initialData?.category ?? "specialized");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [spotsLeft, setSpotsLeft] = useState(initialData?.spotsLeft ?? 0);

  // Dzieci / grupy
  const [childrenOptions, setChildrenOptions] = useState<IChild[]>([]);
  const [selectedChildren, setSelectedChildren] =
    useState<string[]>(initialData?.children ?? []);

  // Pobierz dzieci i grupy
  useEffect(() => {
    (async () => {
      try {
        const groupsSnap = await getDocs(collection(db, "groups"));
        const groupList = groupsSnap.docs.map((d) => d.data() as any);

        const snap = await getDocs(collection(db, "children"));
        const list = snap.docs.map((d) => {
          const data = d.data() as any;
          const grp = groupList.find((g: any) => g.children?.includes(d.id));
          return {
            id: d.id,
            name: data.name || "No Name",
            surname: data.surname || "",
            group: grp?.name ?? "Ungrouped",
          } as IChild;
        });
        setChildrenOptions(list);
      } catch (err) {
        console.error(err);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować dzieci lub grup.",
          variant: "destructive",
        });
      }
    })();
  }, []);

  // Grupuj dzieci wg `group`
  const groupedChildren = childrenOptions.reduce<
    Record<string, IChild[]>
  >((acc, c) => {
    const key = c.group || "Ungrouped";
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  // Zaznacz całą grupę
  const handleSelectGroup = (groupName: string) => {
    const ids = (groupedChildren[groupName] || []).map((c) => c.id);
    setSelectedChildren((prev) => Array.from(new Set([...prev, ...ids])));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dt = combineDateTime(date, startTime);
    if (!dt) {
      toast({
        title: "Błąd",
        description: "Nieprawidłowa data lub godzina.",
        variant: "destructive",
      });
      return;
    }

    // Przygotuj payload
    const payload: any = {
      name: title,
      description,
      location,
      price,
      children: selectedChildren,
      updatedAt: Timestamp.now(),
    };

    if (eventType === "workshop") {
      Object.assign(payload, {
        capacity: capacity || 12,
        category,
        imageUrl,
        spotsLeft: spotsLeft || 0,
        date: dt,
        time: `${startTime} - ${endTime}`,
      });
    } else {
      Object.assign(payload, {
        type: "",
        instructor,
        schedule: {
          days: days ? days.split(",").map((d) => d.trim()) : [],
          startTime,
          endTime,
          date: dt,
        },
        capacity,
        enrolledStudents: 0,
        ageRange,
        status: "active",
        currency: "PLN",
      });
    }

    try {
      const col = eventType === "workshop" ? "workshops" : "classes";
      if (isEdit && initialData) {
        await updateDoc(doc(db, col, initialData.id), payload);
        toast({ title: "Zaktualizowano", description: "Event został zaktualizowany." });
      } else {
        payload.createdAt = Timestamp.now();
        await addDoc(collection(db, col), payload);
        toast({
          title: "Dodano",
          description:
            eventType === "workshop"
              ? "Warsztat został utworzony."
              : "Zajęcia zostały utworzone.",
        });
      }
      // Reset
      setTitle("");
      setDescription("");
      setLocation("");
      setPrice(0);
      setDate("");
      setStartTime("");
      setEndTime("");
      setInstructor("");
      setDays("");
      setCapacity(0);
      setAgeRange("");
      setCategory("specialized");
      setImageUrl("");
      setSpotsLeft(0);
      setSelectedChildren([]);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać eventu.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Typ eventu */}
      <div className="grid gap-2">
        <Label htmlFor="eventType">Select Event Type</Label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value as "class" | "workshop")}
          className="rounded-md border px-3 py-2"
        >
          <option value="class">Class</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>

      {/* Wspólne pola */}
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Price (PLN)</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      {/* Zajęcia */}
      {eventType === "class" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Enter instructor name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="days">Days (comma separated)</Label>
            <Input
              id="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="e.g., Monday, Wednesday"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ageRange">Age Range</Label>
            <Input
              id="ageRange"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              placeholder="e.g., 5-10"
            />
          </div>
        </>
      )}

      {/* Warsztaty */}
      {eventType === "workshop" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="spotsLeft">Spots Left</Label>
            <Input
              id="spotsLeft"
              type="number"
              value={spotsLeft}
              onChange={(e) => setSpotsLeft(Number(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Children Selector */}
      <div className="space-y-2">
        <Label>Children</Label>
        <EnhancedChildrenSelector
          groupedChildren={groupedChildren}
          selected={selectedChildren}
          onChange={setSelectedChildren}
        />
      </div>

      <Button type="submit">
        {eventType === "workshop" ? (isEdit ? "Save Workshop" : "Add Workshop") : (isEdit ? "Save Class" : "Add Class")}
      </Button>
    </form>
  );
}