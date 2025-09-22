import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock,
  FaFacebookF, FaInstagram, FaYoutube, FaTiktok
} from "react-icons/fa";

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

/* ========= Delikatny pattern tła ========= */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/></svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast({
        title: "Brakujące informacje",
        description: "Wypełnij wszystkie wymagane pola.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Wyślij do API / Firestore / Cloud Function
      await new Promise((r) => setTimeout(r, 900));
      toast({
        title: "Wiadomość wysłana",
        description: "Dziękujemy! Skontaktujemy się z Tobą wkrótce.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem z wysłaniem wiadomości. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white">
      <Helmet>
        <title>Kontakt — PerfectTune</title>
        <meta name="description" content="Skontaktuj się z PerfectTune — zapisy, warsztaty, pytania organizacyjne." />
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
            <motion.div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4" {...fade(0.1)}>
              <span className="text-xs tracking-wide text-white/80">Masz pytania? Napisz do nas</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Skontaktuj się z PerfectTune</h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              Z chęcią doradzimy w wyborze zajęć, terminów i zapisów na warsztaty.
            </p>
          </motion.div>
        </div>
      </section>

      {/* GŁÓWNA SEKCJA: formularz + dane kontaktowe */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-14">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-6"
            {...fade(0.06)}
          >
            {/* FORMULARZ (glass card) */}
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8"
              {...scaleIn(0.05)}
            >
              <h2 className="text-2xl font-bold mb-6">Wyślij wiadomość</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/85">Imię i nazwisko</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jan Kowalski"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/85">Adres email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white/85">Temat</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Wybierz temat" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0F19] border-white/10 text-white">
                      <SelectItem value="zapytanie-o-zajecia">Zapytanie o zajęcia</SelectItem>
                      <SelectItem value="rejestracja-na-warsztaty">Rejestracja na warsztaty</SelectItem>
                      <SelectItem value="lekcje-prywatne">Lekcje prywatne</SelectItem>
                      <SelectItem value="inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white/85">Wiadomość</Label>
                  <Textarea
                    id="message"
                    placeholder="Twoja wiadomość..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
                      </svg>
                      Wysyłanie...
                    </div>
                  ) : "Wyślij wiadomość"}
                </Button>
              </form>
            </motion.div>

            {/* PANELE INFORMACYJNE */}
            <motion.aside className="space-y-6">
              {/* Dane kontaktowe */}
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6"
                {...scaleIn(0.08)}
              >
                <h3 className="text-xl font-bold mb-4">Dane kontaktowe</h3>
                <div className="space-y-5 text-white/85">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-3">
                      <FaMapMarkerAlt className="text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Nasza lokalizacja</div>
                      <p>ul. Muzyczna 12, 06-400 Ciechanów<br/>Polska</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-3">
                      <FaPhoneAlt className="text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Telefon</div>
                      <p>(+48) 23 123 45 67</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-3">
                      <FaEnvelope className="text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Email</div>
                      <p>kontakt@perfecttune.pl</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-cyan-500/20 p-3">
                      <FaClock className="text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Godziny</div>
                      <p>Pn–Pt: 9:00–20:00 • Sb: 10:00–16:00 • Nd: zamknięte</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="font-semibold mb-3">Obserwuj nas</div>
                  <div className="flex gap-3">
                    {[FaFacebookF, FaInstagram, FaYoutube, FaTiktok].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                        aria-label="social"
                      >
                        <Icon />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mapa */}
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
                {...scaleIn(0.1)}
              >
                <div className="aspect-video">
                  <iframe
                    title="PerfectTune — lokalizacja"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2538.138276783991!2d20.617!3d52.881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471e131456789abc%3A0x1234567890abcdef!2sCiechan%C3%B3w!5e0!3m2!1spl!2spl!4v1681400000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            </motion.aside>
          </motion.div>
        </div>
      </section>

      {/* CTA końcowe */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-20">
          <motion.div
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6"
            {...scaleIn(0.06)}
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Chcesz nas odwiedzić?</h3>
              <p className="mt-2 text-white/80 max-w-xl">
                Umów wizytę w naszej siedzibie i porozmawiaj z instruktorem. Pomożemy dobrać idealne zajęcia.
              </p>
            </div>
            <Button className="bg-white text-neutral-900 hover:bg-white/90 font-semibold">
              Umów wizytę
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
