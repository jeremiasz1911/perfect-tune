import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getClasses } from "@/lib/db";

interface Workshop {
  id: string;
  name: string;
  date: string;
  time: string;
  spotsLeft: number;
  price: number;
}

const HeroSection = () => {
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        // This would normally fetch from Firebase
        // Mocking the data for now
        const mockWorkshops: Workshop[] = [
          {
            id: "1",
            name: "Wartszaty z produkcji muzyki",
            date: "24 kwietnia 2025",
            time: "16:30",
            spotsLeft: 4,
            price: 45
          },
          {
            id: "2",
            name: "Warszaty z gry na ukulele",
            date: "25 lipca 2025",
            time: "10:00",
            spotsLeft: 2,
            price: 50
          }
        ];
        
        setUpcomingWorkshops(mockWorkshops);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <section id="home" className="relative bg-neutral-800 text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: `url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')`}}>
      </div>
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h1 className="font-accent text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Odkryj <span className="text-primary">Radość</span> z  Muzyki
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-100">
              Dołącz do naszych warsztatów i zajęć, aby odkryć swoje talenty muzyczne w przyjaznym środowisku.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/workshops">
                <Button className="bg-primary hover:bg-white hover:text-black text-white  px-6 py-3 w-full sm:w-auto">
                  Sprawdz Warsztaty
                </Button>
              </Link>
              <Link href="/classes">
                <Button className="border-2 bg-white/0 border-white hover:bg-gray-200 hover:text-neutral-800 text-white font-medium px-6 py-3 w-full sm:w-auto">
                  Zobacz Zajęcia
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-neutral-800">
              <h3 className="font-heading text-xl font-bold mb-4 text-center">Nadchodzące Warsztaty:</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {upcomingWorkshops.map((workshop) => (
                    <div key={workshop.id} className="mb-4 last:mb-0 p-4 border-l-4 border-primary bg-neutral-50 rounded">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-primary">{workshop.name}</h4>
                        <span className="text-sm bg-secondary-light text-neutral-500 px-2 py-1 rounded-full">Zostały {workshop.spotsLeft}  miejsca</span>
                      </div>
                      <p className="text-neutral-600 text-sm">{workshop.date} • {workshop.time}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-neutral-700">{workshop.price} zł</span>
                        <Link href={`/workshops/${workshop.id}`} className="text-primary hover:text-primary-dark text-sm font-medium inline-block">
                          Dowiedz się więcej →
                        </Link>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              <div className="mt-4 text-center">
                <Link href="/workshops" className="text-primary hover:text-primary-dark font-medium inline-block">
                  Zobacz wszystkie warsztaty <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
