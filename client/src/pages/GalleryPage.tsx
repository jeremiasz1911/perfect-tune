import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, X, Image as ImageIcon } from "lucide-react";

/* ========= Delikatny pattern tła ========= */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/></svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

/* ========= Animacje ========= */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});
const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, delay } },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.55, delay } },
});

/* ========= Mock danych ========= */
const galleryImages = [
  { id: 1,  src: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1600&q=80", alt: "Piano workshop",             category: "workshops" },
  { id: 2,  src: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1600&q=80", alt: "Guitar student performance", category: "performances" },
  { id: 3,  src: "https://images.unsplash.com/photo-1560184611-046a9d11d689?auto=format&fit=crop&w=1600&q=80", alt: "Children's music class",     category: "classes" },
  { id: 4,  src: "https://images.unsplash.com/photo-1576179635662-9d1983e97e62?auto=format&fit=crop&w=1600&q=80", alt: "Violin lesson",             category: "classes" },
  { id: 5,  src: "https://images.unsplash.com/photo-1535406208535-1429804efd76?auto=format&fit=crop&w=1600&q=80", alt: "Group music class",         category: "classes" },
  { id: 6,  src: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=1600&q=80", alt: "Concert performance",       category: "performances" },
  { id: 7,  src: "https://images.unsplash.com/photo-1570431862176-636b33d539e1?auto=format&fit=crop&w=1600&q=80", alt: "Cello lesson",              category: "classes" },
  { id: 8,  src: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=1600&q=80", alt: "Composition workshop",      category: "workshops" },
  { id: 9,  src: "https://images.unsplash.com/photo-1517898717281-8e4385a41802?auto=format&fit=crop&w=1600&q=80", alt: "Piano recital",             category: "performances" },
  { id: 10, src: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=1600&q=80", alt: "Vocal training",            category: "classes" },
  { id: 11, src: "https://images.unsplash.com/photo-1485561222814-e6c50477491b?auto=format&fit=crop&w=1600&q=80", alt: "Summer music camp",         category: "workshops" },
  { id: 12, src: "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?auto=format&fit=crop&w=1600&q=80", alt: "Guitar ensemble",           category: "performances" },
];

type Img = { id: number; src: string; alt: string; category: string };

const GalleryPage = () => {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<null | Img>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(galleryImages.map((g) => g.category)))],
    []
  );

  const images = useMemo(() => {
    const q = query.trim().toLowerCase();
    return galleryImages.filter((img) => {
      const okCat = filter === "all" ? true : img.category === filter;
      const okText = !q || img.alt.toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [filter, query]);

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white">
      <Helmet>
        <title>Galeria — PerfectTune</title>
        <meta name="description" content="Zobacz zdjęcia z warsztatów, zajęć i występów w PerfectTune." />
      </Helmet>

      {/* TŁO: gradient + pattern */}
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

      {/* HERO */}
      <section className="relative">
        <div className="container mx-auto px-4 pt-16 pb-10 md:pt-20 md:pb-12">
          <motion.div className="text-center" {...fadeUp(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
              <ImageIcon className="w-4 h-4 text-cyan-300" />
              <span className="text-xs tracking-wide text-white/80">Chwile z naszych zajęć i warsztatów</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Galeria PerfectTune</h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              Odkryj energię i radość tworzenia — od warsztatów po występy naszych uczniów.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTRY + SZUKAJKA */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-6">
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4 md:p-6"
            {...scaleIn(0.05)}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-white/70 mr-1">Filtr:</span>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={filter === cat ? "default" : "outline"}
                    onClick={() => setFilter(cat)}
                    className={
                      filter === cat
                        ? "bg-cyan-500 hover:bg-cyan-400 text-neutral-900 border-transparent"
                        : "border-white/15 text-white hover:bg-white/10"
                    }
                  >
                    {cat === "all" ? "Wszystko" : cat[0].toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="md:ml-auto w-full md:w-[340px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Szukaj (np. piano, concert)…"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <section className="relative pb-16">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="popLayout">
            {images.length ? (
              <motion.div
                key="grid"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                {...fade(0.08)}
              >
                {images.map((img) => (
                  <motion.button
                    key={img.id}
                    onClick={() => setSelected(img)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  >
                    <div
                      className="h-48 md:h-56 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${img.src}")` }}
                      aria-label={img.alt}
                    />
                    {/* gradient & tag */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-sm font-medium line-clamp-1">{img.alt}</div>
                          <div className="text-[11px] text-white/70 capitalize">{img.category}</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="px-2 py-1 rounded-md border border-white/10 bg-white/10 text-xs">Podgląd</div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center"
                {...fadeUp(0.1)}
              >
                <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
                <p className="text-white/70 mb-6">Spróbuj zmienić filtr lub frazę wyszukiwania.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                  className="border-white/15 text-white hover:bg-white/10"
                >
                  Pokaż wszystko
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* LIGHTBOX */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <DialogClose className="absolute top-2 right-2 z-10">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/80 hover:bg-white text-neutral-900"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
                <img
                  src={selected.src}
                  alt={selected.alt}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-white/10 bg-black/50"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* CTA */}
      <section className="relative pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur p-8 md:p-10 text-center"
            {...scaleIn(0.06)}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Dołącz do naszego następnego wydarzenia</h2>
            <p className="mt-2 text-white/80 max-w-2xl mx-auto">
              Zobacz harmonogram i zarezerwuj miejsce na warsztatach lub zapisz się na zajęcia.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                Nadchodzące warsztaty
              </Button>
              <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
                Zobacz zajęcia
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
