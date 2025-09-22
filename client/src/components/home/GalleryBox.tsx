import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = {
  id: string;
  url: string;
  tag?: "zajęcia" | "warsztaty" | "koncerty" | "studio" | "inne";
  w?: number; // opcjonalne – do ewentualnego sortowania/aspektu
  h?: number;
};

// fallback (jeśli nie ma nic w firestore)
const DEFAULT_ITEMS: GalleryItem[] = [
  { id: "g1", url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1800&auto=format&fit=crop", tag: "studio" },
  { id: "g2", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1800&auto=format&fit=crop", tag: "zajęcia" },
  { id: "g3", url: "https://images.unsplash.com/photo-1513863329456-b9e9a006e3c1?q=80&w=1800&auto=format&fit=crop", tag: "warsztaty" },
  { id: "g4", url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1800&auto=format&fit=crop", tag: "koncerty" },
  { id: "g5", url: "https://images.unsplash.com/photo-1492175742197-ed20dc5a6bed?q=80&w=1800&auto=format&fit=crop", tag: "zajęcia" },
  { id: "g6", url: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1800&auto=format&fit=crop", tag: "studio" },
  { id: "g7", url: "https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=1800&auto=format&fit=crop", tag: "warsztaty" },
  { id: "g8", url: "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?q=80&w=1800&auto=format&fit=crop", tag: "koncerty" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<"wszystko" | GalleryItem["tag"]>("wszystko");
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // do lightboxa

  // wczytaj z firestore (jeśli jest), inaczej fallback
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        if (!snap.empty) {
          const fromDb: GalleryItem[] = snap.docs.map((d) => {
            const data = d.data() as DocumentData;
            return {
              id: d.id,
              url: String(data?.url || ""),
              tag: (data?.tag as GalleryItem["tag"]) ?? "inne",
              w: typeof data?.w === "number" ? data.w : undefined,
              h: typeof data?.h === "number" ? data.h : undefined,
            };
          }).filter((x) => x.url);
          setItems(fromDb.length ? fromDb : DEFAULT_ITEMS);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "wszystko") return items;
    return items.filter((it) => it.tag === filter);
  }, [items, filter]);

  const openAt = useCallback((idx: number) => setActiveIndex(idx), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* Nagłówek */}
        <motion.div className="flex items-end justify-between gap-4 mb-6" {...fadeUp(0.05)}>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xs tracking-wide text-white/80">Galeria PerfectTune</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Zobacz nas w akcji</h2>
            <p className="text-white/70 mt-2">Ujęcia ze studia, zajęć, warsztatów i koncertów.</p>
          </div>
          <a href="/gallery">
            <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
              Zobacz więcej
            </Button>
          </a>
        </motion.div>

        {/* Filtry */}
        <motion.div className="mb-6 flex flex-wrap gap-2" {...fadeUp(0.1)}>
          {(["wszystko", "zajęcia", "warsztaty", "koncerty", "studio"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-all border ${
                filter === f
                  ? "bg-white text-neutral-900 border-transparent"
                  : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Masonry (CSS columns) */}
        <AnimatePresence mode="sync">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-4"
          >
            {filtered.map((it, idx) => (
              <motion.button
                key={it.id}
                onClick={() => openAt(idx)}
                className="relative mb-4 block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-left group"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <img
                  src={it.url}
                  alt={it.tag || "Zdjęcie"}
                  loading="lazy"
                  className="w-full h-auto object-cover block"
                />
                {/* overlay na hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                <div className="absolute left-3 bottom-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs text-white/90">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {it.tag ?? "foto"}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Lightbox */}
        <Dialog open={activeIndex !== null} onOpenChange={(o) => !o && close()}>
          <DialogContent className="max-w-5xl p-0 bg-black/90 border-white/10">
            <div className="relative">
              {activeIndex !== null && (
                <>
                  <img
                    src={filtered[activeIndex].url}
                    alt="Podgląd"
                    className="w-full h-auto object-contain max-h-[80vh] bg-black"
                  />

                  {/* nawigacja */}
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 hover:bg-white/15"
                    aria-label="Poprzednie"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 hover:bg-white/15"
                    aria-label="Następne"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  {/* pasek info */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/50 rounded-full px-3 py-1 border border-white/10">
                    {activeIndex + 1} / {filtered.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
