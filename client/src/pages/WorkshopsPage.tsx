import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { getClasses } from "@/lib/db";
import {
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

interface Workshop {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  spotsLeft: number;
  imageUrl: string;
}

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        // This would normally fetch from Firebase
        // Mocking the data for now
        const mockWorkshops: Workshop[] = [
          {
            id: "1",
            name: "Guitar Fundamentals",
            description: "Master the basics of guitar playing from proper posture to chord progressions and simple song performance.",
            category: "Guitar",
            date: "July 15, 2023",
            time: "2:00 PM - 5:00 PM",
            location: "Studio A",
            price: 45,
            spotsLeft: 4,
            imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "2",
            name: "Piano for Beginners",
            description: "Start your piano journey with this comprehensive workshop covering keyboard basics, notation, and simple pieces.",
            category: "Piano",
            date: "July 22, 2023",
            time: "10:00 AM - 1:00 PM",
            location: "Studio B",
            price: 50,
            spotsLeft: 2,
            imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "3",
            name: "Finding Your Voice",
            description: "Discover your unique vocal style through breathing techniques, range development, and expressive performance.",
            category: "Vocal",
            date: "August 5, 2023",
            time: "3:00 PM - 6:00 PM",
            location: "Studio C",
            price: 55,
            spotsLeft: 6,
            imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "4",
            name: "Rhythm Basics",
            description: "Learn essential rhythm skills applicable to any instrument through fun, engaging exercises and games.",
            category: "Theory",
            date: "August 12, 2023",
            time: "1:00 PM - 3:00 PM",
            location: "Studio A",
            price: 35,
            spotsLeft: 8,
            imageUrl: "https://images.unsplash.com/photo-1527853306803-9587ea85891d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "5",
            name: "Violin Essentials",
            description: "Get started with violin basics including proper holding technique, bow control, and playing your first melodies.",
            category: "Violin",
            date: "August 19, 2023",
            time: "11:00 AM - 2:00 PM",
            location: "Studio B",
            price: 50,
            spotsLeft: 5,
            imageUrl: "https://images.unsplash.com/photo-1558584673-c834fb1cc3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "6",
            name: "Music Production Fundamentals",
            description: "Learn the basics of digital music production, recording techniques, and simple mixing using industry-standard software.",
            category: "Production",
            date: "August 26, 2023",
            time: "4:00 PM - 7:00 PM",
            location: "Studio C",
            price: 60,
            spotsLeft: 3,
            imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          }
        ];
        
        setWorkshops(mockWorkshops);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || workshop.category.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const categories = ["all", ...new Set(workshops.map(workshop => workshop.category.toLowerCase()))];

  return (
    <>
      <Helmet>
        <title>Music Workshops - MusicAcademy</title>
        <meta name="description" content="Browse and register for upcoming music workshops at MusicAcademy." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">Upcoming Music Workshops</h1>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Dive into intensive, focused sessions designed to build specific skills and explore new musical concepts with expert instructors.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search workshops..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              </div>
            </div>
            <div className="w-full md:w-auto flex items-center">
              <FaFilter className="text-neutral-500 mr-2" />
              <span className="mr-2 text-sm font-medium">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(category)}
                    className={filter === category ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url('${workshop.imageUrl}')`}}></div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary-light text-white text-xs font-semibold rounded-full mb-3">
                      {workshop.category}
                    </span>
                    <h3 className="font-heading text-xl font-bold mb-2">{workshop.name}</h3>
                    <p className="text-neutral-600 mb-4 line-clamp-3">
                      {workshop.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaCalendar className="text-primary mr-2 flex-shrink-0" />
                        <span>{workshop.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaClock className="text-primary mr-2 flex-shrink-0" />
                        <span>{workshop.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaMapMarkerAlt className="text-primary mr-2 flex-shrink-0" />
                        <span>{workshop.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <FaUsers className="text-primary mr-2 flex-shrink-0" />
                        <span>{workshop.spotsLeft} spots left</span>
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-neutral-800">${workshop.price}</span>
                        <Link href={`/register?workshop=${workshop.id}`}>
                          <Button className="bg-primary hover:bg-primary-dark text-white">
                            Register Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">No workshops found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button variant="outline" onClick={() => {setSearchTerm(""); setFilter("all");}}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-accent text-3xl font-bold mb-6">Workshop FAQs</h2>
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-bold text-xl mb-2">What should I bring to a workshop?</h3>
                <p className="text-neutral-600">
                  For most workshops, we provide all necessary equipment and materials. However, if you have your own instrument, you're welcome to bring it. We recommend bringing a notebook and pencil for taking notes, and a water bottle to stay hydrated.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">What if I need to cancel my registration?</h3>
                <p className="text-neutral-600">
                  We offer full refunds for cancellations made at least 7 days before the workshop date. Cancellations within 7 days may receive a partial refund or credit toward future workshops, depending on the circumstances.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Are workshops suitable for complete beginners?</h3>
                <p className="text-neutral-600">
                  Yes! Each workshop description specifies the recommended experience level. Many of our workshops are designed specifically for beginners with no prior musical experience.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Is there an age requirement for workshops?</h3>
                <p className="text-neutral-600">
                  Most workshops are appropriate for ages 8 and up, though some are specifically designed for adults or younger children. Check the individual workshop description for age recommendations or contact us for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl font-bold mb-6">Request a Custom Workshop</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Don't see what you're looking for? We can create custom workshops for groups, schools, or private events. Contact us to discuss your needs.
          </p>
          <Link href="/contact">
            <Button className="bg-white text-primary hover:bg-neutral-100 font-medium px-8 py-3">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default WorkshopsPage;
