import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCountdown } from "@/components/utils/useCountdown";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import {
  Calendar as CalendarIcon,
  Clock3,
  MapPin,
  ArrowRight,
  Music2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/* ========== Animacje / utils ========== */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});
const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, delay } },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, delay } },
});

/* ========== Typy ========== */
type Workshop = {
  id: string;
  title: string;
  startDate: Date;
  price?: number;
  cover?: string;
};

type Lesson = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  price?: number;
  billingModel?: "monthly" | "per_lesson";
  cover?: string;
  schedule?: {
    days?: string[];    // np. ["Mon","Wed"] albo ["Poniedziałek","Środa"]
    startTime?: string; // "16:30"
    endTime?: string;   // opcjonalnie
  };
};

type UpcomingLesson = {
  lesson: Lesson;
  nextAt: Date;
};

/* ========== Tło z delikatnym patternem ========== */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/>
   </svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

/* ========== Mapowanie dni tygodnia (PL/EN) ========== */
const DOW: Record<string, number> = {
  // EN
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
  // PL skróty i pełne
  nie: 0, niedziela: 0,
  pon: 1, poniedziałek: 1, "poniedzialek": 1,
  wto: 2, wtorek: 2,
  śro: 3, sro: 3, środa: 3, "sroda": 3,
  czw: 4, czwartek: 4,
  pia: 5, piatek: 5, "piątek": 5,
  sob: 6, sobota: 6,
};

function parseStartToTodayTime(startTime?: string) {
  if (!startTime) return { h: 12, m: 0 };
  const m = /^(\d{1,2}):(\d{2})$/.exec(startTime.trim());
  if (!m) return { h: 12, m: 0 };
  const h = Math.max(0, Math.min(23, Number(m[1])));
  const mi = Math.max(0, Math.min(59, Number(m[2])));
  return { h, m: mi };
}

/** Zwraca najbliższe wystąpienie według schedule.days + startTime */
function nextOccurrenceFromSchedule(schedule?: Lesson["schedule"]): Date | null {
  if (!schedule?.days || schedule.days.length === 0) return null;
  const { h, m } = parseStartToTodayTime(schedule.startTime);

  const now = new Date();
  const todayDow = now.getDay();

  // normalizuj dni do [0..6]
  const wanted = schedule.days
    .map((d) => DOW[(d || "").toLowerCase()])
    .filter((n) => typeof n === "number") as number[];
  if (wanted.length === 0) return null;

  for (let offset = 0; offset < 14; offset++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() + offset);
    const day = dt.getDay();
    if (wanted.includes(day)) {
      dt.setHours(h, m, 0, 0);
      // jeśli dziś i czas już minął, szukaj dalej
      if (offset === 0 && dt.getTime() <= now.getTime()) continue;
      return dt;
    }
  }
  return null; // coś poszło nie tak
}


/* ========== Slider (hero-carousel) ========== */
const SLIDES = [
  {
    id: "s1",
    title: "ZAJĘCIA UMUZYCZNIAJĄCE - ZESPÓŁ UKULELE",
    text: "Szkolne zajęcia dla twojego dziecka – nauka gry na ukulele, rytmika i dobra zabawa w grupie",
    cta: { label: "Zapisz się", href: "/register" },
    img: "https://images.unsplash.com/photo-1700419420072-8583b28f2036?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  }
];

function UpcomingCard({ lesson, nextAt }: { lesson: Lesson; nextAt: Date }) {
  const c = useCountdown(nextAt); // ✅ hook wywołany na top-level komponentu

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
    >
      <div
        className="h-40 w-full bg-cover bg-center"
        style={{ backgroundImage: `url("${lesson.cover}")` }}
      />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{lesson.title}</h3>
          <Badge className="bg-neutral-900/70 border-white/10">Wkrótce</Badge>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm text-white/85">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {nextAt.toLocaleDateString("pl-PL", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="w-4 h-4" />
            {nextAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {lesson.location}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "dni",  val: c.d },
            { label: "godz", val: c.h },
            { label: "min",  val: c.m },
            { label: "sek",  val: c.s },
          ].map((x) => (
            <div key={x.label} className="rounded-lg border border-white/10 bg-neutral-900/40 p-2 text-center">
              <div className="text-lg font-extrabold">{x.val}</div>
              <div className="text-[10px] tracking-wide uppercase text-white/65">{x.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between items-center">
          <Link href="/register">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
              Zapisz się
            </Button>
          </Link>
          <Link href="/classes">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Szczegóły
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(600px 240px at 80% 0%, rgba(186,230,253,.12), transparent 60%)" }}
      />
    </motion.div>
  );
}

/* ========== Główna strona ========== */

const HomePage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  /* Pobranie warsztatów i zajęć */
  useEffect(() => {
    (async () => {
      try {
        // Workshops
        const ws = await getDocs(collection(db, "workshops"));
        const wList: Workshop[] = ws.docs.map((d) => {
          const data = d.data() as DocumentData;
          const raw = data?.startDate ?? data?.startAt ?? data?.date ?? null;
          const start =
            raw instanceof Timestamp
              ? raw.toDate()
              : raw
              ? new Date(raw)
              : null;

          return {
            id: d.id,
            title: data?.title || "Warsztaty muzyczne",
            startDate: start || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            price: typeof data?.price === "number" ? data.price : undefined,
            cover:
              data?.cover ||
              "https://images.unsplash.com/photo-1526920929361-52d2b699c910?q=80&w=1600&auto=format&fit=crop",
          };
        });
        setWorkshops(
          wList
            .filter((w) => w.startDate.getTime() >= Date.now() - 3 * 60 * 60 * 1000)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        );

        // Lessons
        const ls = await getDocs(collection(db, "lessons"));
        const lList: Lesson[] = ls.docs.map((d) => {
          const data = d.data() as DocumentData;
          const billingModel =
            data?.billing?.model ??
            (data?.billing?.pricePerLesson != null || data?.price != null
              ? "per_lesson"
              : "monthly");

          const price =
            billingModel === "monthly"
              ? Number(data?.billing?.priceMonthly ?? data?.price ?? 0)
              : Number(data?.billing?.pricePerLesson ?? data?.price ?? 0);

          return {
            id: d.id,
            title: data?.title || data?.name || "Zajęcia muzyczne",
            description:
              data?.description ||
              "Indywidualne lub grupowe zajęcia dostosowane do poziomu uczestnika.",
            location: data?.location || "PerfectTune Studio",
            price,
            billingModel,
            cover:
              data?.cover ||
              "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1600&auto=format&fit=crop",
            schedule: data?.schedule || null,
          };
        });

        setLessons(
          lList
            .sort((a, b) => (a.title > b.title ? 1 : -1))
            .slice(0, 3) // tylko 3 na głównej
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  /* Auto-przewijanie slidera */
  useEffect(() => {
    const next = () => setHeroIndex((i) => (i + 1) % SLIDES.length);
    timerRef.current = window.setInterval(next, 5500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const nextWorkshop = workshops[0] ?? null;
  const workshopCountdown = useCountdown(nextWorkshop?.startDate ?? null);

  /* Najbliższe zajęcia – liczymy nextAt z lesson.schedule */
  const upcoming: UpcomingLesson[] = useMemo(() => {
    const list: UpcomingLesson[] = lessons
      .map((lesson) => ({
        lesson,
        nextAt: nextOccurrenceFromSchedule(lesson.schedule) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }))
      .filter(Boolean) as UpcomingLesson[];
    return list
      .filter((u) => u.nextAt.getTime() > Date.now() - 60 * 1000)
      .sort((a, b) => a.nextAt.getTime() - b.nextAt.getTime());
  }, [lessons]);

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white">
      <Helmet>
        <title>PerfectTune — zajęcia i warsztaty | Gabriela Wiśniewskiego</title>
        <meta
          name="description"
          content="PerfectTune — działalność jednoosobowa Gabriela Wiśniewskiego. Zajęcia dla dzieci i młodzieży, produkcja muzyczna, warsztaty. Zapisz się już dziś!"
        />
      </Helmet>

      {/* TŁO: gradient + delikatny pattern */}
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

      {/* ====== HERO: Slider + Info ====== */}
      <section className="relative overflow-hidden">
        <div className=" mx-auto pb-6 md:pt-18 md:pb-8">
          <div className="grid grid-cols-1 ">
         
            {/* Slider */}
            <div className="relative border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
              <div className="relative h-[360px] sm:h-[440px]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={SLIDES[heroIndex].id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.0, scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("${SLIDES[heroIndex].img}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "grayscale(10%) contrast(105%)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/30 to-transparent" />
                    <div className="relative h-full flex items-end">
                      <div className="p-6 sm:p-8">
                        <div className="inline-flex font-black items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 mb-4">
                          <Sparkles className="w-4 h-4 text-white" />
                          <span className="text-xs tracking-wide text-white/80">
                            PerfectTune — Gabriela Wiśniewskiego
                          </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                          {SLIDES[heroIndex].title}
                        </h1>
                        <p className="mt-3 text-white/85 max-w-2xl">
                          {SLIDES[heroIndex].text}
                        </p>
                        <div className="mt-6">
                          <Link href={SLIDES[heroIndex].cta.href}>
                            <Button className="bg-white hover:bg-white/50 text-neutral-900 font-semibold">
                              {SLIDES[heroIndex].cta.label}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* wskaźniki */}
                <div className="absolute bottom-3 right-4 flex gap-2">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.id}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setHeroIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === heroIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
                     
            {/* Najbliższy warsztat + licznik */}
            {nextWorkshop && workshopCountdown && (
              <motion.div
                className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 overflow-hidden"
                {...scaleIn(0.08)}
              >
                <div
                  className="absolute inset-0 opacity-[0.10]"
                  style={{
                    backgroundImage: `url("${nextWorkshop.cover}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative">
                  <Badge className="bg-neutral-900/60 text-white border-white/10">Najbliższe warsztaty</Badge>
                  <h3 className="mt-3 text-2xl font-bold">{nextWorkshop.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-white/85 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {nextWorkshop.startDate.toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Licznik */}
                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {[
                      { label: "dni", val: workshopCountdown.d },
                      { label: "godz", val: workshopCountdown.h },
                      { label: "min", val: workshopCountdown.m },
                      { label: "sek", val: workshopCountdown.s },
                    ].map((x) => (
                      <div
                        key={x.label}
                        className="rounded-xl border border-white/10 bg-neutral-900/40 p-3 text-center"
                      >
                        <div className="text-2xl font-extrabold">{x.val}</div>
                        <div className="text-[11px] tracking-wide uppercase text-white/65">{x.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/workshops">
                      <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">
                        Zapisz się
                      </Button>
                    </Link>
                    <Link href="/workshops">
                      <Button className="border-white/15 text-white hover:bg-white/10">
                        Zobacz wszystkie
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Dlaczego PerfectTune ===== */}
      {/* <section className="relative">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <motion.div className="grid gap-6 md:grid-cols-3" {...fade(0.05)}>
            {[
              {
                title: "Indywidualne podejście",
                desc:
                  "Program dopasowuję do Twoich potrzeb — każdy ma w sobie potencjał do tworzenia niesamowitych dźwięków.",
              },
              {
                title: "Technika + kreatywność",
                desc:
                  "Łączę solidne podstawy techniczne z rozwojem kreatywności i pracy w zespole.",
              },
              {
                title: "Praktyka projektowa",
                desc:
                  "Pracujemy nad realnymi projektami, by Twoja muzyka brzmiała profesjonalnie i oryginalnie.",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                whileHover={{ y: -4, rotate: -0.3 }}
                transition={{ type: "spring", stiffness: 180, damping: 15 }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-cyan-500/20 p-2">
                    <Music2 className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h4 className="font-semibold">{f.title}</h4>
                </div>
                <p className="mt-3 text-white/80">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ===== Najbliższe zajęcia (zliczone z schedule) ===== */}
      {upcoming.length > 0 && (
        <section className="relative">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <motion.div className="flex items-end justify-between gap-4 mb-6" {...fadeUp(0.05)}>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Najbliższe zajęcia
                </h2>
                <p className="text-white/70 mt-2">
                  Zobacz, które zajęcia startują już wkrótce. Idealne dla dzieci i młodzieży.
                </p>
              </div>
              <Link href="/classes">
                <Button className="border-white/15 text-white hover:bg-white/10">
                  Pełna oferta
                </Button>
              </Link>
            </motion.div>

            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" {...fade(0.12)}>
              {upcoming.slice(0, 3).map(({ lesson, nextAt }) => (
                <UpcomingCard key={lesson.id} lesson={lesson} nextAt={nextAt} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== Zajęcia (3 karty) ===== */}
      <section className="relative">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <motion.div className="flex items-end justify-between gap-4 mb-6" {...fadeUp(0.05)}>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Zajęcia stałe
              </h2>
              <p className="text-white/70 mt-2">
                Wybrane propozycje. Pełną ofertę zobaczysz w sekcji Zajęcia.
              </p>
            </div>
            <Link href="/classes">
              <Button className="bg-white text-neutral-900 hover:bg-white/10 font-semibold">
                Zobacz wszystkie
              </Button>
            </Link>
          </motion.div>

          <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" {...fade(0.1)}>
            {lessons.map((cls) => (
              <motion.div
                key={cls.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
                whileHover={{ y: -4, rotate: -0.2 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${cls.cover}")` }}
                />
                <div className="p-5">
                  <h3 className="text-lg font-bold">{cls.title}</h3>
                  <p className="mt-2 text-sm text-white/75 line-clamp-3">
                    {cls.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {cls.location}
                    </span>
                    {typeof cls.price === "number" && (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="w-4 h-4" />
                        {cls.billingModel === "monthly"
                          ? `Opłata: ${cls.price} zł/mies.`
                          : `Cena: ${cls.price} zł / lekcja`}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex justify-between">
                    <Link href="/register">
                      <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                        Zapisz się
                      </Button>
                    </Link>
                    <Link href="/classes">
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        Szczegóły
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(600px 240px at 80% 0%, rgba(186,230,253,.12), transparent 60%)",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {lessons.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
              Aktualnie nie możemy wyświetlić zajęć. Spróbuj ponownie za chwilę lub przejdź do sekcji „Zajęcia”.
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/classes">
              <Button className="bg-white text-neutral-900 hover:bg-white/10 font-semibold">
                Zobacz więcej zajęć
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== O mnie / treść (Twoje opisy) ===== */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-16">
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur"
            {...fade(0.05)}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
              O PerfectTune
            </h2>
            <div className="grid gap-6 md:grid-cols-1 text-white/85 leading-relaxed">
              <p>
                Perfecttune to działalność jednoosobowa Gabriela Wiśniewskiego. Jestem multiinstrumentalistą, 
                muzykiem sesyjnym, pedagogiem, instruktorem oraz pasjonatem muzyki, dla którego największą radością
                jest dzielenie się wiedzą i inspirowanie innych. Głównym sercem mojej działalności jest prowadzenie
                edukacji muzycznej – miejsca, w którym każdy, niezależnie od wieku i poziomu zaawansowania, może odkryć
                i rozwijać swój muzyczny potencjał w przyjaznej i twórczej atmosferze.
              </p>
              <p>
                Zajęcia z produkcji muzycznej prowadzę od 2021 roku, traktując je jako fascynujący element 
                wszechstronnego rozwoju muzycznego. Przez moje kursy przewinęły się już setki osób, które stworzyły 
                tysiące unikatowych produkcji. Moją największą dumą jest jednak nie finalny produkt, a proces nauki, 
                postępy moich uczniów oraz wyjątkowa, pozbawiona presji atmosfera, jaka towarzyszy naszym spotkaniom. 
                Moje doświadczenie muzyczne oraz umiejętności pedagogiczne pozwalają mi z sukcesem zarażać innych 
                pasją do wyrażania siebie poprzez muzykę.
              </p>
              <p>
                Do każdego uczestnika podchodzę indywidualnie, aby zapewnić pełną satysfakcję z odbytych zajęć. 
                Wierzę, że każdy ma w sobie potencjał do tworzenia niesamowitych dźwięków i melodii, dlatego dostosowuję
                program do indywidualnych potrzeb i oczekiwań. Uczę nie tylko obsługi narzędzi, ale przede wszystkim 
                rozwijam kreatywność, wrażliwość muzyczną i umiejętność współpracy — dzięki temu Twoja muzyka jest 
                technicznie dopracowana i pełna autentycznych emocji. W Perfecttune znajdziesz przestrzeń do eksperymentowania,
                popełniania błędów i czerpania radości z każdego, nawet najmniejszego, muzycznego odkrycia.
              </p>
              
            </div>

            <div className="mt-6">
              <Link href="/about">
                <Button className="bg-white text-neutral-900 hover:bg-white/10 font-semibold">
                  Dowiedz się więcej
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
