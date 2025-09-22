import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { FaSchool, FaClock, FaDollarSign, FaMapMarkerAlt } from "react-icons/fa";

/* ========== Animacje ========== */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});
const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.55, delay } },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.55, delay } },
});

/* ========== Pattern tła ========== */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/></svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

/* ========== Typy ========== */
type SchoolKey = "SP1" | "SP4" | "SP5" | "inne";

type BillingModel = "monthly" | "per_lesson";

type Zajecia = {
  id: string;
  nazwa: string;
  opis: string;
  poziom: string;
  czasTrwania: string;
  cena: number;
  billingModel: BillingModel;
  uwagi?: string;
  location: string;
  subgroup?: "G1" | "G2" | "other"; // tylko dla SP4 (Grupa I – wtorek, Grupa II – środa)
};

/* ========== Utils ========== */
function inferBillingAndPrice(data: any): { billingModel: BillingModel; price: number } {
  const model: BillingModel =
    (data?.billing?.model as BillingModel) ||
    (data?.billing?.pricePerLesson != null || data?.price != null ? "per_lesson" : "monthly");

  const price =
    model === "monthly"
      ? Number(data?.billing?.priceMonthly ?? data?.price ?? 0)
      : Number(data?.billing?.pricePerLesson ?? data?.price ?? 0);

  return { billingModel: model, price: isFinite(price) ? price : 0 };
}

function minutesBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map((n: string) => parseInt(n, 10));
  const [eh, em] = end.split(":").map((n: string) => parseInt(n, 10));
  if ([sh, sm, eh, em].some((v) => !Number.isFinite(v))) return null;
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins > 0 ? mins : null;
}

/** Normalizacja lokalizacji do bucketów szkół */
function detectSchool(locationRaw?: string): SchoolKey {
  const loc = String(locationRaw || "").toLowerCase();

  // typowe warianty zapisu
  if (/(^|\s)sp[\s\-]*1\b/.test(loc) || /podstawowa.*(nr|no\.?)\s*1.*ciech/.test(loc)) return "SP1";
  if (/(^|\s)sp[\s\-]*4\b/.test(loc) || /podstawowa.*(nr|no\.?)\s*4.*ciech/.test(loc)) return "SP4";
  if (/(^|\s)sp[\s\-]*5\b/.test(loc) || /podstawowa.*(nr|no\.?)\s*5.*ciech/.test(loc)) return "SP5";
  return "inne";
}

/** Wyznacz grupę dla SP4 na podstawie dni tygodnia */
function detectSP4Subgroup(days?: string[]): "G1" | "G2" | "other" | undefined {
  if (!Array.isArray(days)) return undefined;
  const norm = days.map((d) => String(d).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""));
  // Wtorek -> Grupa I, Środa -> Grupa II
  if (norm.some((d) => d.includes("wtorek"))) return "G1";
  if (norm.some((d) => d.includes("sroda"))) return "G2";
  return "other";
}

/** Mapowanie dokumentu lesson -> Zajęcia */
function mapLesson(docId: string, data: DocumentData): Zajecia {
  const { billingModel, price } = inferBillingAndPrice(data);

  // czas trwania
  const mins = minutesBetween(data?.schedule?.startTime, data?.schedule?.endTime);
  const czasTrwania = mins ? `${mins}-minutowe sesje` : "60-minutowe sesje";

  // uwagi: miejsca ograniczone na podstawie capacity/participants
  let uwagi: string | undefined;
  const cap = Number(data?.capacity ?? 0);
  const participantsCount = Array.isArray(data?.participants) ? data.participants.length : Number(data?.participantsCount ?? 0);
  const left = cap > 0 ? Math.max(0, cap - participantsCount) : undefined;
  if (typeof left === "number") {
    if (left === 0) uwagi = "Brak wolnych miejsc";
    else if (left <= 3) uwagi = "Miejsca ograniczone";
  }

  return {
    id: docId,
    nazwa: data?.title || data?.name || "Zajęcia muzyczne",
    opis:
      data?.description ||
      "Indywidualne lub grupowe zajęcia dopasowane do poziomu uczestnika.",
    poziom: data?.level || "Dla początkujących",
    czasTrwania,
    cena: price,
    billingModel,
    uwagi,
    location: data?.location || "",
    subgroup: detectSP4Subgroup(data?.schedule?.days),
  };
}

/** Nagłówek zakładki */
function tabTitle(k: SchoolKey) {
  if (k === "SP1") return "SP1 Ciechanów";
  if (k === "SP4") return "SP4 Ciechanów";
  if (k === "SP5") return "SP5 Ciechanów";
  return "Inne lokalizacje";
}

const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState<SchoolKey>("SP1");
  const [loading, setLoading] = useState(true);

  const [bySchool, setBySchool] = useState<Record<SchoolKey, Zajecia[]>>({
    SP1: [],
    SP4: [],
    SP5: [],
    inne: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "lessons"));
        const grouped: Record<SchoolKey, Zajecia[]> = { SP1: [], SP4: [], SP5: [], inne: [] };

        snap.docs.forEach((ds) => {
          const data = ds.data();
          const school = detectSchool(data?.location);
          const mapped = mapLesson(ds.id, data);
          grouped[school].push(mapped);
        });

        // sort estetyczny po nazwie
        (Object.keys(grouped) as SchoolKey[]).forEach((k) => {
          grouped[k].sort((a, b) => (a.nazwa > b.nazwa ? 1 : -1));
        });

        if (mounted) setBySchool(grouped);
      } catch (e) {
        console.error("[ClassesPage] Błąd pobierania lessons:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // czy pokazywać „inne” tylko jeśli są
  const showInne = useMemo(() => bySchool.inne.length > 0, [bySchool.inne.length]);

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white">
      <Helmet>
        <title>Zajęcia — PerfectTune</title>
        <meta
          name="description"
          content="Zespół ukulele i zajęcia umuzykalniające w szkołach: SP1, SP4 (Grupa I i II), SP5 w Ciechanowie. Zapisz się!"
        />
      </Helmet>

      {/* Tło */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1200px 600px at 10% -10%, rgba(88,101,242,.20), transparent 55%),
            radial-gradient(900px 480px at 90% 0%, rgba(186,230,253,.16), transparent 60%),
            radial-gradient(1000px 800px at 50% 120%, rgba(56,189,248,.10), transparent 55%),
            url("${DOT_DATA_URL}")
          `,
          backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
          backgroundSize: "auto, auto, auto, 32px 32px",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-10 md:pt-20 md:pb-12">
          <motion.div className="text-center" {...fadeUp(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
              <FaSchool className="text-cyan-300" />
              <span className="text-xs tracking-wide text-white/80">
                Zajęcia w szkołach — Ciechanów
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Zespół ukulele — zajęcia umuzykalniające
            </h1>
            <p className="mt-3 text-white/80 max-w-2xl mx-auto">
              Wybierz swoją szkołę i grupę. Nowocześnie, kreatywnie i z energią.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/register">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                  Zapisz się
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="border-white/15 text-white hover:bg-white/10">
                  Zapytaj o dobór zajęć
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Zakładki szkół */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-14">
          <motion.div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden" {...scaleIn(0.05)}>
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_2.1fr]">
              {/* Sidebar */}
              <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                <h3 className="text-xl font-bold mb-4">Wybierz szkołę</h3>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SchoolKey)} className="w-full">
                  <TabsList className="grid grid-cols-1 bg-transparent h-auto gap-2">
                    {(["SP1", "SP4", "SP5"] as SchoolKey[]).map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="justify-start rounded-lg px-4 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white hover:bg-white/10 transition"
                      >
                        <FaSchool className="mr-3" />
                        <span>{tabTitle(tab)}</span>
                      </TabsTrigger>
                    ))}
                    {showInne && (
                      <TabsTrigger
                        value="inne"
                        className="justify-start rounded-lg px-4 py-3 data-[state=active]:bg-white/10 data-[state=active]:text-white hover:bg-white/10 transition"
                      >
                        <FaMapMarkerAlt className="mr-3" />
                        <span>{tabTitle("inne")}</span>
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </div>

              {/* Treść */}
              <div className="p-6 lg:p-8">
                <Tabs value={activeTab} className="w-full">
                  <AnimatePresence mode="wait">
                    {(["SP1", "SP4", "SP5", "inne"] as SchoolKey[]).map((k) => (
                      <TabsContent value={k} className="mt-0" key={k}>
                        <motion.div {...fadeUp(0.04)}>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">
                              {tabTitle(k)}
                              {k === "SP4" && (
                                <span className="ml-2 text-sm text-white/70">
                                  (Grupa I — Wtorek, Grupa II — Środa)
                                </span>
                              )}
                            </h3>
                            <Link href="/register">
                              <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">
                                Zapisz dziecko
                              </Button>
                            </Link>
                          </div>

                          {/* skeleton */}
                          {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="h-40 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                              ))}
                            </div>
                          ) : k === "SP4" ? (
                            // SP4 – podział na grupy wg dnia
                            <div className="space-y-8">
                              {(["G1", "G2", "other"] as const).map((g) => {
                                const groupTitle =
                                  g === "G1" ? "Grupa I — Wtorek" : g === "G2" ? "Grupa II — Środa" : "Pozostałe terminy";
                                const items = bySchool.SP4.filter((z) => (z.subgroup || "other") === g);
                                if (items.length === 0) return null;
                                return (
                                  <div key={g}>
                                    <h4 className="text-lg font-semibold mb-4">{groupTitle}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {items.map((z) => (
                                        <motion.div key={z.id} {...scaleIn(0.06)}>
                                          <Card className="border-white/10 bg-white/5 backdrop-blur hover:bg-white/[0.07] transition">
                                            <CardContent className="p-5">
                                              <div className="flex justify-between items-start mb-3">
                                                <div>
                                                  <h5 className="font-semibold text-lg">{z.nazwa}</h5>
                                                  <p className="text-white/70 text-sm">{z.poziom}</p>
                                                </div>
                                                {z.uwagi && (
                                                  <span className="px-2 py-1 rounded-full text-xs bg-white/10 border border-white/15">
                                                    {z.uwagi}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-white/80 text-sm">{z.opis}</p>
                                              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                                                <span className="inline-flex items-center gap-2">
                                                  <FaClock className="text-cyan-300" />
                                                  {z.czasTrwania}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                  <FaDollarSign className="text-cyan-300" />
                                                  {z.billingModel === "monthly"
                                                    ? `Opłata: ${z.cena} zł/mies.`
                                                    : `Cena: ${z.cena} zł / lekcja`}
                                                </span>
                                              </div>
                                              <div className="mt-5 flex justify-between items-center border-t border-white/10 pt-4">
                                                <span className="text-xs text-white/60">{z.location}</span>
                                                <Link href="/register">
                                                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                                                    Zapisz się
                                                  </Button>
                                                </Link>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : bySchool[k].length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {bySchool[k].map((z) => (
                                <motion.div key={z.id} {...scaleIn(0.06)}>
                                  <Card className="border-white/10 bg-white/5 backdrop-blur hover:bg-white/[0.07] transition">
                                    <CardContent className="p-5">
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <h5 className="font-semibold text-lg">{z.nazwa}</h5>
                                          <p className="text-white/70 text-sm">{z.poziom}</p>
                                        </div>
                                        {z.uwagi && (
                                          <span className="px-2 py-1 rounded-full text-xs bg-white/10 border border-white/15">
                                            {z.uwagi}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-white/80 text-sm">{z.opis}</p>
                                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                                        <span className="inline-flex items-center gap-2">
                                          <FaClock className="text-cyan-300" />
                                          {z.czasTrwania}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                          <FaDollarSign className="text-cyan-300" />
                                          {z.billingModel === "monthly"
                                            ? `Opłata: ${z.cena} zł/mies.`
                                            : `Cena: ${z.cena} zł / lekcja`}
                                        </span>
                                      </div>
                                      <div className="mt-5 flex justify-between items-center border-t border-white/10 pt-4">
                                        <span className="text-xs text-white/60">{z.location}</span>
                                        <Link href="/register">
                                          <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                                            Zapisz się
                                          </Button>
                                        </Link>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
                              Brak zajęć w tej lokalizacji. Zajrzyj później albo sprawdź inne zakładki.
                            </div>
                          )}
                        </motion.div>
                      </TabsContent>
                    ))}
                  </AnimatePresence>
                </Tabs>

                <div className="mt-8 text-center">
                  <Link href="/contact" className="inline-flex items-center text-white/85 hover:text-white transition font-medium">
                    Masz pytania? Skontaktuj się z nami <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* „Jak działają zajęcia” */}
      {/* <section className="relative">
        <div className="container mx-auto px-4 pb-16">
          <motion.div className="text-center mb-10" {...fadeUp(0.05)}>
            <h2 className="text-3xl font-extrabold tracking-tight">Jak działają nasze zajęcia</h2>
            <p className="mt-2 text-white/75 max-w-2xl mx-auto">
              Uporządkowany proces, który pozwala maksymalnie rozwinąć talent i pewność siebie.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" {...fade(0.1)}>
            {[
              { no: "1", title: "Ocena", text: "Na start sprawdzamy poziom i cele, aby dobrze dobrać program." },
              { no: "2", title: "Plan", text: "Opracowujemy spersonalizowany plan i dobór repertuaru." },
              { no: "3", title: "Praktyka", text: "Regularne, angażujące zajęcia — technika, kreatywność, projekty." },
              { no: "4", title: "Postępy", text: "Monitorujemy efekty i celebrujemy je na występach/warsztatach." },
            ].map((s) => (
              <div key={s.no} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-200 font-bold flex items-center justify-center">{s.no}</div>
                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-white/80 text-sm">{s.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* CTA */}
      {/* <section className="relative">
        <div className="container mx-auto px-4 pb-20">
          <motion.div
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6"
            {...scaleIn(0.05)}
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gotowy na muzyczną podróż?</h3>
              <p className="mt-2 text-white/80 max-w-xl">
                Zapisz się już dziś i odkryj radość tworzenia muzyki. Wystarczy pasja — resztą zajmiemy się razem!
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/register">
                <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">Zapisz się</Button>
              </Link>
              <Link href="/classes">
                <Button className="border-white/15 text-white hover:bg-white/10 px-8">
                  Zobacz pełną ofertę
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};

export default ClassesPage;
