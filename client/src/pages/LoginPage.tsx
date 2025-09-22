import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

// delikatny pattern + gradient tła jak na HomePage
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/>
   </svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] } },
});

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, loginWithGoogle, checkIsAdmin } = useAuth();
  const [, navigate] = useLocation();

  const checkUserRole = async (uid: string): Promise<boolean> => {
    return await checkIsAdmin(uid);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Brakujące pola",
        description: "Uzupełnij e-mail i hasło.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        toast({ title: "Zalogowano", description: "Witaj ponownie w PerfectTune!" });
        const isAdmin = await checkUserRole(user.uid);
        navigate(isAdmin ? "/dashboard/admin" : "/dashboard/parent");
      }
    } catch (error: any) {
      toast({
        title: "Logowanie nieudane",
        description: error?.message || "Sprawdź dane i spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        toast({ title: "Zalogowano przez Google", description: "Miło Cię widzieć!" });
        const isAdmin = await checkUserRole(user.uid);
        navigate(isAdmin ? "/dashboard/admin" : "/dashboard/parent");
      }
    } catch (error: any) {
      toast({
        title: "Błąd logowania Google",
        description: error?.message || "Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Zaloguj się — PerfectTune</title>
        <meta
          name="description"
          content="Zaloguj się do PerfectTune, aby zarządzać zajęciami i warsztatami."
        />
      </Helmet>

      <div className="relative min-h-[88vh] bg-[#0B0F19] text-white">
        {/* TŁO */}
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

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Lewy panel — info/benefity */}
            <motion.div
              {...fadeUp(0.05)}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 md:p-10 flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-5">
                <span className="text-xs tracking-wide text-white/80">PerfectTune — panel rodzica</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Zaloguj się do swojego konta
              </h1>
              <p className="mt-3 text-white/85 max-w-xl">
                Zarządzaj zapisami, płatnościami i komunikacją z instruktorem. Szybko i wygodnie.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Rezerwacje i płatności online",
                  "Harmonogram zajęć dzieci",
                  "Kontakt z instruktorem",
                  "Powiadomienia o warsztatach",
                ].map((t) => (
                  <div
                    key={t}
                    className="rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-3"
                  >
                    <span className="text-white/85">{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/register">
                  <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
                    Nie masz konta? Zarejestruj się
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Prawy panel — formularz */}
            <motion.div
              {...fadeUp(0.12)}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 md:p-10"
            >
              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div>
                  <Label htmlFor="email" className="text-white">Adres e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.com"
                    className="mt-2 bg-neutral-900/40 border-white/10 text-white placeholder:text-white/60"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Hasło</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2 bg-neutral-900/40 border-white/10 text-white placeholder:text-white/60"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
                    <Label htmlFor="remember" className="text-sm text-white/85">
                      Zapamiętaj mnie
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-white/85 hover:text-white">
                    Nie pamiętasz hasła?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                        />
                      </svg>
                      Logowanie…
                    </div>
                  ) : (
                    "Zaloguj się"
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/0 px-3 text-xs text-white/70">albo</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-white/15 text-white hover:bg-white/10"
                >
                  <FaGoogle className="mr-2" />
                  Zaloguj przez Google
                </Button>

                <p className="text-xs text-white/60 text-center mt-2">
                  Logując się, akceptujesz nasz Regulamin i Politykę Prywatności.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
