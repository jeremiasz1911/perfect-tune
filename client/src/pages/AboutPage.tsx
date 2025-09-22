import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaGraduationCap, FaAward, FaUsers, FaMusic, FaSmile, FaGuitar } from "react-icons/fa";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, textVariant, zoomIn } from "@/lib/animations";
import PageTransition from "@/components/ui/PageTransition";

/* Delikatny pattern w tle (kropki) */
const DOT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
     <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.06"/>
   </svg>`
);
const DOT_DATA_URL = `data:image/svg+xml,${DOT_SVG}`;

const AboutPage = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>O PerfectTune — Gabriel Wiśniewski</title>
        <meta
          name="description"
          content="Poznaj Gabriela Wiśniewskiego — multiinstrumentalistę, muzyka sesyjnego i pedagoga. PerfectTune to nowoczesne zajęcia i warsztaty muzyczne dla dzieci i młodzieży."
        />
      </Helmet>

      <div className="relative min-h-screen bg-[#0B0F19] text-white">
        {/* tło: gradienty + pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(1100px 520px at 12% -10%, rgba(88,101,242,.22), transparent 55%),
              radial-gradient(900px 480px at 90% 0%, rgba(186,230,253,.18), transparent 60%),
              radial-gradient(1000px 800px at 50% 115%, rgba(56,189,248,.10), transparent 55%),
              url("${DOT_DATA_URL}")
            `,
            backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
            backgroundSize: "auto, auto, auto, 32px 32px",
          }}
        />

        {/* HERO */}
        <section className="relative pt-16 pb-10 md:pb-14">
          <motion.div
            className="container mx-auto px-4"
            variants={staggerContainer(0.08, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] items-center">
              {/* Tekst */}
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4"
                  variants={fadeIn("up", 0.5, 0.1)}
                >
                  <span className="text-xs tracking-wide text-white/80">PerfectTune — działalność jednoosobowa</span>
                </motion.div>
                <motion.h1
                  className="font-accent text-4xl md:text-5xl font-extrabold leading-tight"
                  variants={textVariant(0.15)}
                >
                  Gabriel Wiśniewski
                </motion.h1>
                <motion.p
                  className="mt-4 text-white/85 leading-relaxed max-w-2xl"
                  variants={fadeIn("up", 0.5, 0.25)}
                >
                  <p className="mb-4">
                    Jestem multiinstrumentalistą, muzykiem sesyjnym i pedagogiem z ponad
                    20-letnim doświadczeniem w nauczaniu gry na instrumentach. Moja muzyczna
                    przygoda to nieustanna pasja, którą z radością dzielę się z innymi.
                  </p>
                  
                  <p className="mb-4">
                    Od ośmiu lat jestem również nauczycielem muzyki i historii w Szkole Podstawowej.
                    Te dwie, pozornie odległe dziedziny, łączę, pokazując młodzieży, że pasja do wiedzy
                    i sztuki idą w parze. Moją największą wartością w pracy z młodymi ludźmi 
                    jest zawsze dobry i przyjazny kontakt. Wierzę, że to fundament, 
                    na którym można zbudować prawdziwe zainteresowanie i motywację. Staram się zarażać
                    ich nie tylko miłością do muzyki, ale także do sportu i zdobywania wiedzy, pokazując,
                    że rozwój na wielu płaszczyznach czyni życie bogatszym. 
                  </p>
                  
                  <p className="mb-4">  
                    Zapraszam do wspólnej muzycznej przygody!
                  </p>
                </motion.p>

                

                <motion.div
                  className="mt-6 flex flex-wrap gap-3"
                  variants={fadeIn("up", 0.5, 0.35)}
                >
                  <Link href="/contact">
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold">
                      Skontaktuj się
                    </Button>
                  </Link>
                  <Link href="/classes">
                    <Button  className="border-white/15 bg-white text-black hover:bg-white/10">
                      Zobacz zajęcia
                    </Button>
                  </Link>
                </motion.div>

                {/* „statystyki” */}
                <motion.div
                  className="mt-8 grid grid-cols-3 gap-4 max-w-md"
                  variants={fadeIn("up", 0.5, 0.45)}
                >
                  {[
                    { k: "15+ lat", v: "Doświadczenia" },
                    { k: "2021", v: "Start zajęć" },
                    { k: "1000+", v: "Utworów uczestników" },
                  ].map((it) => (
                    <div
                      key={it.k}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                    >
                      <div className="text-xl font-extrabold">{it.k}</div>
                      <div className="text-[12px] tracking-wide text-white/70">{it.v}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Obraz */}
              <motion.div
                className="relative h-[360px] sm:h-[440px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur"
                variants={zoomIn(0.6, 0.4)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://scontent-waw2-2.xx.fbcdn.net/v/t39.30808-6/470205622_9089808554391859_3986909528282179897_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=n0dBecyMWJ8Q7kNvwGSnXSz&_nc_oc=Adn_PBvygkaa2YB43i2GHdGecXIz-H7csznGZj-qojqyrcggTTh0-SBBIXfBDoytt6ZNC9_t6QYFqfeDIPRJlJzh&_nc_zt=23&_nc_ht=scontent-waw2-2.xx&_nc_gid=1QFRhykQrNv_7bN3A5PF0A&oh=00_Afa9ypkWM8SpjgQEB9Qn6w23-hTgBuesFibUL5vX6aMc4A&oe=68C85C98')",
                    filter: "grayscale(8%) contrast(105%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-neutral-900/70 px-4 py-2">
                  <p className="text-sm">
                    <span className="font-semibold">Gabriel</span> — instruktor / producent
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <section className="relative">
          
          <motion.div
            className="container mx-auto px-4 py-10 md:py-14"
            variants={staggerContainer(0.08, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6"
              variants={textVariant(0.2)}
            >
              Co oferuję uczestnikom?
            </motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaGraduationCap className="text-cyan-300 text-xl" />,
                  title: "Sprawdzona metoda nauczania",
                  desc: "Wychodzę poza utarte schematy. Wiem, że każde dziecko jest wyjątkowe, dlatego indywidualnie podchodzę do każdego ucznia, dostosowując metody i tempo pracy do jego potrzeb i potencjału. Moim celem jest wydobycie tego, co w nich najlepsze, i pokazanie im ich własnych mocnych stron.",
                },
                {
                  icon: <FaGuitar className="text-cyan-300 text-xl" />,
                  title: "Warsztaty z pasją",
                  desc: "Moim autorskim projektem są innowacyjne zajęcia z Produkcji Muzycznej, które stworzyłem i rozwijam od 2021 roku. Przez moje kursy przewinęły się już setki osób, które wspólnie stworzyły tysiące unikatowych produkcji. Na tych zajęciach uczę nie tylko techniki i obsługi narzędzi, ale także kreatywności i współpracy – wszystko to w przyjaznej i inspirującej atmosferze.",
                },
                {
                  icon: <FaSmile className="text-cyan-300 text-xl" />,
                  title: "Satysfakcja gwarantowana",
                  desc: "Z entuzjazmem patrzę w przyszłość! W 2025 roku ruszam z nowym, ekscytującym projektem: tworzeniem szkolnych zespołów Ukulele. To kolejna inicjatywa, która ma na celu demokratyzację muzyki, pokazanie, że radość z grania i tworzenia w zespole jest dostępna dla każdego.",
                },
                
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  variants={fadeIn("up", 0.45, i * 0.06)}
                  whileHover={{ y: -6, rotate: -0.3 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-white/80">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>          
       
        {/* Filozofia nauczania (2 kolumny x 2) */}
        <section className="relative">
          <motion.div
            className="container mx-auto px-4 pb-10 md:pb-14"
            variants={staggerContainer(0.08, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6"
              variants={textVariant(0.2)}
            >
              Nasza filozofia nauczania
            </motion.h2>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Indywidualne podejście",
                  t1: "Każdy uczeń jest inny — program szyję na miarę Twoich potrzeb i stylu nauki.",
                  t2: "Małe grupy i zajęcia indywidualne = pełna uwaga i realny progres.",
                },
                {
                  title: "Technika + kreatywność",
                  t1: "Solidne podstawy techniczne idą u nas w parze z improwizacją i twórczym myśleniem.",
                  t2: "Eksplorujemy różne gatunki i uczymy się świadomej ekspresji.",
                },
                {
                  title: "Społeczność i współpraca",
                  t1: "Pracujemy w atmosferze wsparcia. Dzielimy się postępami i inspirujemy wzajemnie.",
                  t2: "Organizujemy warsztaty, nagrania i mini-koncerty.",
                },
                {
                  title: "Muzyka na całe życie",
                  t1: "Nie tylko uczę — zaszczepiam miłość do muzyki i rozwijam wrażliwość.",
                  t2: "Dyscyplina, kreatywność, współpraca — kompetencje ważne także poza muzyką.",
                },
              ].map((box, i) => (
                <motion.div
                  key={box.title}
                  variants={fadeIn(i % 2 === 0 ? "right" : "left", 0.45, 0.08 * (i + 1))}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <h3 className="font-semibold">{box.title}</h3>
                  <p className="mt-2 text-white/85">{box.t1}</p>
                  <p className="mt-2 text-white/80">{box.t2}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
        
         {/* 4 KAFELKI — cechy */}
        <section className="relative">
          <motion.div
            className="container mx-auto px-4 py-10 md:py-14"
            variants={staggerContainer(0.08, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >

            <motion.h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6"
              variants={textVariant(0.2)}
            >
            Cechy zajęć
            </motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <FaGraduationCap className="text-cyan-300 text-xl" />,
                  title: "Nowoczesna edukacja",
                  desc: "iPady, DAW, kreatywne aplikacje — łączymy praktykę z technologią.",
                },
                {
                  icon: <FaAward className="text-cyan-300 text-xl" />,
                  title: "Warsztaty z pasją",
                  desc: "Energia i inspiracja dla początkujących oraz zaawansowanych.",
                },
                {
                  icon: <FaUsers className="text-cyan-300 text-xl" />,
                  title: "Dla każdego",
                  desc: "Dzieci, młodzież i dorośli — program dopasowany do Ciebie.",
                },
                {
                  icon: <FaMusic className="text-cyan-300 text-xl" />,
                  title: "Tworzenie muzyki",
                  desc: "Od podstaw do własnych utworów — teoria + praktyka.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  variants={fadeIn("up", 0.45, i * 0.06)}
                  whileHover={{ y: -6, rotate: -0.3 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-white/80">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
    
        {/* CTA */}
        <section className="relative pb-16">
          <motion.div
            className="container mx-auto px-4"
            variants={staggerContainer(0.08, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-10 backdrop-blur text-center"
              variants={fadeIn("up", 0.5, 0.15)}
            >
              <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
                Dołącz do nas już dziś!
              </h2>
              <p className="text-white/85 max-w-2xl mx-auto">
                Zapisz dziecko na zajęcia z produkcji muzycznej — nowocześnie, kreatywnie i w świetnej atmosferze.
                Od pierwszych dźwięków po własne, dumne nagrania.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold px-8">
                    Zarejestruj się teraz
                  </Button>
                </Link>
                <Link href="/classes">
                  <Button  className="bg-white border-white/15 text-black hover:bg-white/10 px-8">
                    Zobacz zajęcia
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Subtelny noise na całość */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"140\" viewBox=\"0 0 100 100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>')",
            backgroundRepeat: "repeat",
          }}
        />
      </div>
    </PageTransition>
  );
};

export default AboutPage;
