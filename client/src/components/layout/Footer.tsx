import { Link } from "wouter";
import { Instagram, Facebook, Youtube, Music4, ArrowRight, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#0B0F19] text-white">
      {/* top gradient border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white to-white/60 text-[#0B0F19] grid place-items-center font-black">
                PT
              </div>
              <div>
                <div className="font-extrabold">Perfect<span className="text-white/70">Tune</span></div>
                <div className="text-[11px] text-white/50">Gabriela Wiśniewskiego</div>
              </div>
            </div>
            <p className="mt-4 text-white/75">
              Jakość i pasja w każdym dźwięku. Zajęcia i warsztaty, które rozwijają kreatywność dzieci i młodzieży.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* menu */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link href="/" className="hover:text-white">Start</Link></li>
              <li><Link href="/about" className="hover:text-white">O mnie</Link></li>
              <li><Link href="/workshops" className="hover:text-white">Warsztaty</Link></li>
              <li><Link href="/gallery" className="hover:text-white">Galeria</Link></li>
              <li><Link href="/classes" className="hover:text-white">Zajęcia</Link></li>
              <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
            </ul>
          </div>

          {/* oferta */}
          <div>
            <h4 className="font-semibold mb-4">Oferta</h4>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Produkcja muzyczna</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Instrumenty: gitara, pianino</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Wokal</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Zajęcia grupowe</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Warsztaty tematyczne</li>
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Biuletyn</h4>
            <p className="text-white/75 mb-3">
              Zapisz się, aby dostawać info o nowych warsztatach i promocjach.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: obsługa subskrypcji
              }}
              className="flex items-stretch rounded-xl overflow-hidden border border-white/10"
            >
              <div className="flex items-center px-3 bg-white/5">
                <Mail className="h-4 w-4 text-white/70" />
              </div>
              <input
                type="email"
                placeholder="Twój e-mail"
                className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-white/50"
                required
              />
              <button
                type="submit"
                className="bg-white text-[#0B0F19] hover:bg-white/90 px-3"
                aria-label="Zapisz do newslettera"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-[11px] text-white/50">
              Zapis oznacza akceptację polityki prywatności. Możesz zrezygnować w każdej chwili.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <div>© {new Date().getFullYear()} PerfectTune. Wszystkie prawa zastrzeżone.</div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white">Regulamin</Link>
            <Link href="/privacy" className="hover:text-white">Polityka prywatności</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
