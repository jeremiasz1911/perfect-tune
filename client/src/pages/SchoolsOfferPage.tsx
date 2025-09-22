import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Guitar,
  Music2,
  CalendarDays,
  Clock3,
  Users,
  ShieldCheck,
  Bus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";

/* ========== Animacje ========== */
const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, delay } },
});
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.55, delay } },
});

/* ========== Komponent ========== */
const SchoolsOfferPage = () => {
  // Szybka wycena — prosta kalkulacja orientacyjna
  const [participants, setParticipants] = useState<number>(24);
  const [duration, setDuration] = useState<string>("60"); // minuty
  const [format, setFormat] = useState<string>("ukulele"); // ukulele | polkolonie

  const estimate = useMemo(() => {
    const mins = Number(duration) || 60;
    const hours = Math.max(1, Math.round(mins / 60));
    // Założenia przykładowe (orientacyjne):
    // Ukulele: baza 500 zł / 60 min / grupa do 25 os. + 20 zł/os./h powyżej 25
    // Półkolonie: baza 1800 zł / dzień (9:00–15:00) / grupa do 25 os. + 25 zł/os./dzień powyżej 25
    if (format === "polkolonie") {
      const basePerDay = 1800;
      const extra = Math.max(0, participants - 25) * 25;
      return basePerDay + extra;
    } else {
      const basePerHour = 500;
      const extra = Math.max(0, participants - 25) * 20 * hours;
      return basePerHour * hours + extra;
    }
  }, [participants, duration, format]);

  return (
    <PageTransition>
      <Helmet>
        <title>Oferta dla szkół i świetlic — PerfectTune</title>
        <meta
          name="description"
          content="Warsztaty z ukulele dla klas oraz półkolonie muzyczne. Programy dla szkół i świetlic — instrumenty zapewnione, nowoczesne metody, dyplomy dla uczestników."
        />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0B0F19] text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(1100px 520px at 10% -10%, rgba(88,101,242,.18), transparent 55%),
              radial-gradient(900px 480px at 90% 0%, rgba(186,230,253,.12), transparent 60%),
              radial-gradient(1000px 800px at 50% 120%, rgba(56,189,248,.10), transparent 55%)
            `,
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="container mx-auto px-4 pt-16 pb-10 md:pt-20 md:pb-14 relative">
          <motion.div className="max-w-3xl" {...fadeUp(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xs tracking-wide text-white/80">
                Oferta dla szkół i świetlic
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Warsztaty z ukulele dla klasy &nbsp;•&nbsp; Półkolonie muzyczne
            </h1>
            <p className="mt-4 text-white/85 max-w-2xl">
              PerfectTune (działalność jednoosobowa Gabriela Wiśniewskiego) oferuje
              nowoczesne programy muzyczne dla placówek edukacyjnych. Zapewniamy
              instrumenty, materiały i bezpieczną organizację. Zróbmy razem coś,
              co uczniowie zapamiętają na długo!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                  Zamów warsztaty
                </Button>
              </Link>
              <Link href="/workshops">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Zobacz terminy
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DWA PROGRAMY */}
      <section className="bg-[#0B0F19] text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <motion.div className="grid gap-6 md:grid-cols-2" {...fade(0.05)}>
            {/* Ukulele */}
            <motion.div
              className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/20 p-2">
                  <Guitar className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-xl font-bold">Warsztaty ukulele dla klasy</h3>
              </div>
              <p className="mt-3 text-white/85">
                Lekcja muzyki, która łączy rytm, współpracę i radość wspólnego grania.
                Idealne na 45–90 minut w klasie lub auli. Instrumenty zapewniamy.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/85">
                <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />45–90 min</span>
                <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" />do ~25 os.</span>
                <span className="inline-flex items-center gap-2"><School className="w-4 h-4" />w klasie lub auli</span>
                <span className="inline-flex items-center gap-2"><Music2 className="w-4 h-4" />instrumenty w cenie</span>
              </div>
              <div className="mt-5">
                <Badge className="bg-neutral-900/70 border-white/10">od ~500 zł / 60 min</Badge>
              </div>
              <div className="mt-6">
                <ul className="list-disc list-inside text-white/85 space-y-1 text-sm">
                  <li>nauka 3–4 akordów i prostych rytmów</li>
                  <li>granie znanych melodii wspólnie</li>
                  <li>krótki występ na koniec zajęć</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/register">
                  <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">Rezerwuj termin</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">Zapytaj o szczegóły</Button>
                </Link>
              </div>
            </motion.div>

            {/* Półkolonie */}
            <motion.div
              className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/20 p-2">
                  <CalendarDays className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-xl font-bold">Półkolonie muzyczne</h3>
              </div>
              <p className="mt-3 text-white/85">
                3–5 dni muzycznej przygody (np. 9:00–15:00): ukulele, wokal, beatmaking
                i produkcja muzyczna na iPadach. Moduły dobieramy do wieku i liczby dzieci.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/85">
                <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />blok dzienny</span>
                <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" />grupy ~15–25 os.</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" />opieka i przerwy</span>
                <span className="inline-flex items-center gap-2"><Bus className="w-4 h-4" />u Was lub w naszej sali</span>
              </div>
              <div className="mt-5">
                <Badge className="bg-neutral-900/70 border-white/10">wycena indywidualna</Badge>
              </div>
              <div className="mt-6">
                <ul className="list-disc list-inside text-white/85 space-y-1 text-sm">
                  <li>moduły: ukulele • wokal • beatmaking • iPady/DAW</li>
                  <li>minikoncert na finał • dyplomy dla uczestników</li>
                  <li>możliwa dokumentacja foto/wideo</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/contact">
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">Złóż zapytanie</Button>
                </Link>
                <Link href="/workshops">
                  <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">Zobacz inspiracje</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* HARMONOGRAMY PRZYKŁADOWE */}
      <section className="bg-[#0B0F19] text-white">
        <div className="container mx-auto px-4 pb-4">
          <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur" {...fadeUp(0.05)}>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Jak to wygląda w praktyce?</h2>
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5">
                <h3 className="font-semibold">Warsztaty ukulele — 45–60 min</h3>
                <ul className="mt-3 text-white/85 space-y-2 text-sm">
                  <li>• Rozdanie instrumentów i krótkie zasady bezpieczeństwa</li>
                  <li>• Rozgrzewka rytmiczna i pierwszy akord</li>
                  <li>• Drugi/trzeci akord + prosty rytm</li>
                  <li>• Wspólne zagranie znanej melodii</li>
                  <li>• Mały występ + podsumowanie</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-neutral-900/30 p-5">
                <h3 className="font-semibold">Półkolonie — dzień przykładowy</h3>
                <ul className="mt-3 text-white/85 space-y-2 text-sm">
                  <li>• 9:00–10:30 — ukulele / rytm / integracja</li>
                  <li>• 10:30–10:45 — przerwa</li>
                  <li>• 10:45–12:15 — produkcja muzyczna (iPady/DAW)</li>
                  <li>• 12:15–12:45 — posiłek/przerwa</li>
                  <li>• 12:45–14:45 — wokal / beatmaking / próba</li>
                  <li>• 14:45–15:00 — podsumowanie dnia</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CO ZAPEWNIAMY */}
      <section className="bg-[#0B0F19] text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <motion.h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" {...fade(0.05)}>
            Co zapewniamy w cenie
          </motion.h2>
          <motion.div className="grid gap-6 md:grid-cols-3 mt-6" {...fade(0.1)}>
            {[
              { icon: <Music2 className="w-5 h-5 text-cyan-300" />, t: "Instrumenty i materiały", d: "Ukulele (zapasowe sztuki), kostki, śpiewniki, podkłady, nuty." },
              { icon: <ShieldCheck className="w-5 h-5 text-cyan-300" />, t: "Bezpieczeństwo i kultura pracy", d: "Zasady BHP, opieka instruktora, dostosowanie do wieku." },
              { icon: <Users className="w-5 h-5 text-cyan-300" />, t: "Instruktor z doświadczeniem", d: "Wieloletnia praktyka z dziećmi i młodzieżą, świetna atmosfera." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-cyan-500/20 p-2">{f.icon}</div>
                  <h4 className="font-semibold">{f.t}</h4>
                </div>
                <p className="mt-3 text-white/80">{f.d}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SZYBKA WYCENA (interaktywna) */}
      <section className="bg-[#0B0F19] text-white">
        <div className="container mx-auto px-4 pb-6">
          <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur" {...scaleIn(0.05)}>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Szybka wycena (orientacyjnie)</h2>
            <p className="text-white/75 mt-2 text-sm">Wycena nie jest wiążąca — dokładną ofertę prześlemy po krótkiej rozmowie.</p>

            <div className="grid gap-4 md:grid-cols-4 mt-5">
              <div>
                <Label className="text-white/85">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-neutral-900/40 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Wybierz format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ukulele">Warsztaty ukulele</SelectItem>
                    <SelectItem value="polkolonie">Półkolonie muzyczne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/85">Liczba uczestników</Label>
                <Input
                  type="number"
                  min={5}
                  max={40}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="bg-neutral-900/40 border-white/10 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-white/85">Czas trwania</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-neutral-900/40 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Czas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                    <SelectItem value="120">120 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-2xl border border-white/10 bg-neutral-900/40 p-4">
                  <div className="text-white/70 text-xs uppercase tracking-wide">Szacunkowo</div>
                  <div className="text-2xl font-extrabold mt-1">{estimate.toLocaleString("pl-PL")} zł</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">
                  Poproś o oficjalną ofertę
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
                  Rezerwacja wstępna
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0B0F19] text-white pb-16">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" {...fade(0.05)}>
            FAQ — najczęstsze pytania
          </motion.h2>

          <motion.div className="mt-6 grid gap-4 md:grid-cols-2" {...fade(0.1)}>
            {[
              {
                q: "Czy zapewniacie instrumenty?",
                a: "Tak. Przyjeżdżamy z zestawem ukulele (zapasowe sztuki), kostkami i materiałami. Potrzebujemy wyłącznie sali z krzesłami/ławami.",
              },
              {
                q: "Dla jakiego wieku są warsztaty?",
                a: "Dostosowujemy poziom do grupy. Najczęściej: klasy 1–3, 4–6, 7–8 oraz szkoły średnie. Mamy osobne warianty dla świetlic i domów kultury.",
              },
              {
                q: "Ile osób może wziąć udział?",
                a: "Rekomendujemy ~25 osób na grupę (można dzielić klasy na tury). Większe grupy wymagają indywidualnych ustaleń.",
              },
              {
                q: "Czy wystawiacie fakturę?",
                a: "Tak. Wystawiamy fakturę i przesyłamy kompletną ofertę z kosztorysem na adres placówki.",
              },
              {
                q: "Czy możecie przyjechać do nas?",
                a: "Tak. Dojeżdżamy do szkół/świetlic. Możliwa też realizacja w naszej sali — ustalimy logistykę i dojazd.",
              },
              {
                q: "Czy można zakończyć występem?",
                a: "Jak najbardziej! Często kończymy krótkim wspólnym mini-koncertem i wręczeniem dyplomów.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-300" />
                  <h4 className="font-semibold">{item.q}</h4>
                </div>
                <p className="mt-2 text-white/80">{item.a}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA końcowe */}
          <motion.div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-center" {...scaleIn(0.05)}>
            <h3 className="text-xl md:text-2xl font-bold">Brzmi dobrze?</h3>
            <p className="text-white/80 mt-2">
              Daj znać, a dopasujemy program i termin do Twojej placówki.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <Link href="/contact">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                  Skontaktuj się
                </Button>
              </Link>
              <Link href="/workshops">
                <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
                  Sprawdź dostępne warsztaty
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default SchoolsOfferPage;
