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
                <div className="text-[11px] text-white/50">Gabriel Wiśniewski</div>
              </div>
            </div>
            <p className="mt-4 text-white/75">
              Jakość i pasja w każdym dźwięku. Zajęcia i warsztaty, które rozwijają kreatywność dzieci i młodzieży.
            </p>
            <div className="mt-4 flex items-center gap-3">
            
            </div>
          </div>

          {/* menu */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link href="/" className="hover:text-white">Start</Link></li>
              <li><Link href="/about" className="hover:text-white">O mnie</Link></li>
              <li><Link href="/classes" className="hover:text-white">Zajęcia</Link></li>
              <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
            </ul>
          </div>

          {/* oferta */}
          <div>
            <h4 className="font-semibold mb-4">Oferta</h4>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Produkcja muzyczna</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Instrumenty: ukulele</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Zajęcia grupowe</li>
              <li className="flex items-center gap-2"><Music4 className="h-4 w-4" /> Warsztaty tematyczne</li>
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Panel</h4>
            <p className="text-white/75 mb-3">
              Stwórz konto i zarządzaj swoimi zajęciami oraz płatnościami.
              Zapisy na zajęcia i warsztaty dostępne po zalogowaniu.
            </p>
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="inline-block bg-white text-[#0B0F19] hover:bg-white/90 px-4 py-2 rounded-lg font-semibold transition text-xs"
            >
              Zaloguj się / Zarejestruj
            </button>
            <div className="mt-6">
       
          </div>
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
