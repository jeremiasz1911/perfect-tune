import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getUserByUid } from "@/lib/db";
import { Menu, X, ChevronDown } from "lucide-react";

const links = [
  { href: "/", label: "Start" },
  { href: "/about", label: "O mnie" },
  { href: "/classes", label: "Zajęcia" },
  { href: "/contact", label: "Kontakt" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) return setRole(null);
    (async () => {
      try {
        const u = await getUserByUid(user.uid);
        setRole((u as any)?.role ?? null);
      } catch {
        setRole(null);
      }
    })();
  }, [user]);

  const isActive = (href: string) => location === href;

  return (
    <nav
      className={[
        "sticky top-0 z-50 transition-shadow",
        "bg-[#0B0F19]/70 backdrop-blur supports-[backdrop-filter]:bg-[#0B0F19]/60",
        isScrolled ? "shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)]" : "",
        "border-b border-white/10",
      ].join(" ")}
    >
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-white to-white/60 text-[#0B0F19] grid place-items-center font-black">
              PT
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">
                Perfect<span className="text-white/70">Tune</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                Gabriel Wiśniewski
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "relative px-3 py-2 text-sm font-medium",
                  "text-white/80 hover:text-white transition",
                ].join(" ")}
              >
                <span>{l.label}</span>
                {/* wskaźnik aktywnego linku */}
                <span
                  className={[
                    "absolute left-3 right-3 -bottom-1 h-[2px] rounded-full transition-all",
                    isActive(l.href) ? "bg-white opacity-100" : "bg-white/0 opacity-0",
                  ].join(" ")}
                />
              </Link>
            ))}

            {/* User area */}
            {user ? (
              <div className="relative ml-2">
                <Button
                  variant="ghost"
                  className="text-white/90 hover:bg-white/10"
                  onClick={() => setShowUserMenu((s) => !s)}
                >
                  {user.email?.split("@")[0]}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0B0F19] shadow-xl overflow-hidden"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <Link
                      href={role === "admin" ? "/dashboard/admin" : "/dashboard/parent"}
                      className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                    >
                      Panel
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button className="ml-2 bg-white text-[#0B0F19] hover:bg-white/90 font-semibold">
                  Zaloguj
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile button */}
          <button
            className="md:hidden text-white/90 hover:text-white"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Otwórz menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    "block px-3 py-2 rounded-lg",
                    "text-white/85 hover:bg-white/10",
                    isActive(l.href) ? "bg-white/10" : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}
              <div className="px-2 pt-2">
                {user ? (
                  <>
                    <Link
                      href={role === "admin" ? "/dashboard/admin" : "/dashboard/parent"}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-lg text-white/85 hover:bg-white/10"
                    >
                      Panel
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-white/85 hover:bg-white/10"
                    >
                      Wyloguj
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-white text-[#0B0F19] hover:bg-white/90 font-semibold mt-2">
                      Zaloguj
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
