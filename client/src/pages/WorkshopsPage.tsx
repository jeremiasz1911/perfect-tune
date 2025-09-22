import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp, DocumentData } from "firebase/firestore";

/* ========= Typ kart ========= */
type ClassCard = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;     // np. „15 lipca 2025”
  time: string;     // np. „10:00 – 13:00” lub „10:00”
  location: string;
  price: number;
  spotsLeft: number;
  imageUrl: string;
  startAtMs: number; // do sortowania
};

/* ========= Utils ========= */
function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (v instanceof Timestamp) return v.toDate();
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function formatPLDate(d: Date) {
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });
}
function formatPLTime(d: Date) {
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}
function isWorkshopLike(data: any): boolean {
  const raw =
    (data?.type ?? data?.kind ?? data?.format ?? data?.category ?? "")
      .toString()
      .toLowerCase();

  const hasExplicitWorkshop =
    raw.includes("workshop") || raw.includes("warsztat") || raw.includes("event");

  const hasConcreteDate =
    toDateSafe(data?.startDate ?? data?.startAt ?? data?.date ?? data?.startsAt) !== null;

  return hasExplicitWorkshop || hasConcreteDate;
}

/* ========= Component ========= */
const WorkshopsPage = () => {
  const [items, setItems] = useState<ClassCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("wszystkie");

  useEffect(() => {
    (async () => {
      try {
        // Pobieramy z kolekcji "classes"
        const snap = await getDocs(collection(db, "classes"));
        const now = Date.now();

        const mapped: ClassCard[] = snap.docs
          .map((d) => {
            const data = d.data() as DocumentData;

            // Bierzemy tylko „warsztatowe” klasy
            if (!isWorkshopLike(data)) return null;

            // Daty
            const startRaw = data.startDate ?? data.startAt ?? data.date ?? data.startsAt ?? null;
            const endRaw   = data.endDate   ?? data.endAt   ?? data.endsAt   ?? null;

            const start = toDateSafe(startRaw) ?? new Date(now + 7 * 24 * 3600 * 1000);
            const end   = toDateSafe(endRaw);

            const timeStr = end
              ? `${formatPLTime(start)} – ${formatPLTime(end)}`
              : (data.time as string) || formatPLTime(start);

            // Pozostałe pola
            const name =
              data.title || data.name || "Zajęcia / warsztaty";
            const description =
              data.description ||
              "Jednorazowe zajęcia prowadzone w formie warsztatu przez doświadczonego instruktora.";
            const category =
              data.category || "Warsztat";
            const location =
              data.location || "PerfectTune Studio";
            const price =
              typeof data.price === "number" ? data.price : Number(data.price ?? 0);
            const imageUrl =
              data.cover ||
              data.imageUrl ||
              "https://images.unsplash.com/photo-1526920929361-52d2b699c910?q=80&w=1600&auto=format&fit=crop";

            // Wolne miejsca
            let spotsLeft = 0;
            if (typeof data.spotsLeft === "number") {
              spotsLeft = data.spotsLeft;
            } else if (typeof data.capacity === "number") {
              const participantsCount = Array.isArray(data.participants) ? data.participants.length : 0;
              spotsLeft = Math.max(0, data.capacity - participantsCount);
            }

            return {
              id: d.id,
              name,
              description,
              category,
              date: formatPLDate(start),
              time: timeStr,
              location,
              price,
              spotsLeft,
              imageUrl,
              startAtMs: start.getTime(),
            } as ClassCard;
          })
          .filter(Boolean) as ClassCard[];

        // Tylko nadchodzące + sort po dacie
        const upcoming = mapped
          .filter((x) => x.startAtMs >= now - 2 * 60 * 60 * 1000) // 2h tolerancji
          .sort((a, b) => a.startAtMs - b.startAtMs);

        setItems(upcoming);
      } catch (e) {
        console.error("Błąd podczas pobierania klas:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => ["wszystkie", ...Array.from(new Set(items.map((w) => w.category.toLowerCase())))],
    [items]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((w) => {
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q);
      const matchesFilter =
        filter === "wszystkie" || w.category.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, filter]);

  return (
    <>
      <Helmet>
        <title>Zajęcia (warsztatowe) — PerfectTune</title>
        <meta
          name="description"
          content="Jednorazowe zajęcia typu warsztat — produkcja muzyki, instrumenty, wokal. Zapisz się!"
        />
      </Helmet>

      {/* HERO */}
      <section className="bg-neutral-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">
            Zajęcia — format warsztatowy
          </h1>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            Jednorazowe, intensywne spotkania w stylu warsztatu — idealne, żeby spróbować nowych tematów.
          </p>
        </div>
      </section>

      {/* LISTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Szukaj zajęć..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center">
              <FaFilter className="text-neutral-500 mr-2" />
              <span className="mr-2 text-sm font-medium">Filtruj:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(category)}
                    className={filter === category ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Karty */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url('${w.imageUrl}')` }}
                  />
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary-light text-white text-xs font-semibold rounded-full mb-3">
                      {w.category}
                    </span>
                    <h3 className="font-heading text-xl font-bold mb-2">{w.name}</h3>
                    <p className="text-neutral-600 mb-4 line-clamp-3">{w.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaCalendar className="text-primary mr-2" />
                        <span>{w.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaClock className="text-primary mr-2" />
                        <span>{w.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaMapMarkerAlt className="text-primary mr-2" />
                        <span>{w.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaUsers className="text-primary mr-2" />
                        <span>{w.spotsLeft} wolnych miejsc</span>
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-neutral-800">{w.price} zł</span>
                        <Link href={`/register?class=${w.id}`}>
                          <Button className="bg-primary hover:bg-primary-dark text-white">
                            Zapisz się
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">Brak pasujących zajęć</h3>
              <p className="text-neutral-600 mb-6">Spróbuj zmienić frazę wyszukiwania lub filtr.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilter("wszystkie");
                }}
              >
                Wyczyść filtry
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl font-bold mb-6">Nie znalazłeś terminu?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Daj znać, przygotujemy termin pod Twoją grupę lub szkołę.
          </p>
          <Link href="/contact">
            <Button className="bg-white text-primary hover:bg-neutral-100 font-medium px-8 py-3">
              Skontaktuj się
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default WorkshopsPage;
