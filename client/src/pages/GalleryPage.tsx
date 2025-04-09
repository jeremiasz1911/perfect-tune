import { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

// Gallery images with their details
const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Piano workshop",
    category: "workshops"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Guitar student performance",
    category: "performances"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1560184611-046a9d11d689?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Children's music class",
    category: "classes"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1576179635662-9d1983e97e62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Violin lesson",
    category: "classes"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1535406208535-1429804efd76?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Group music class",
    category: "classes"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Concert performance",
    category: "performances"
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1570431862176-636b33d539e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Cello lesson",
    category: "classes"
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Composition workshop",
    category: "workshops"
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1517898717281-8e4385a41802?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Piano recital",
    category: "performances"
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Vocal training",
    category: "classes"
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1485561222814-e6c50477491b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Summer music camp",
    category: "workshops"
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Guitar ensemble",
    category: "performances"
  }
];

const GalleryPage = () => {
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<null | { src: string; alt: string }>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: { src: string; alt: string }) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const filteredImages = filter === "all" 
    ? galleryImages 
    : galleryImages.filter(image => image.category === filter);

  return (
    <>
      <Helmet>
        <title>Gallery - MusicAcademy</title>
        <meta name="description" content="Explore our gallery of music workshops, classes, and performances at MusicAcademy." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">Our Music Journey</h1>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Take a glimpse at our workshops, performances, and the musical moments we've shared together.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="text-neutral-600 font-medium">Filter by:</span>
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              All
            </Button>
            <Button 
              variant={filter === "classes" ? "default" : "outline"}
              onClick={() => setFilter("classes")}
              className={filter === "classes" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              Classes
            </Button>
            <Button 
              variant={filter === "workshops" ? "default" : "outline"}
              onClick={() => setFilter("workshops")}
              className={filter === "workshops" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              Workshops
            </Button>
            <Button 
              variant={filter === "performances" ? "default" : "outline"}
              onClick={() => setFilter("performances")}
              className={filter === "performances" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              Performances
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="overflow-hidden rounded-lg h-64 relative cursor-pointer group"
                onClick={() => handleImageClick(image)}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-primary bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <Search className="text-white text-2xl" />
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">No images found</h3>
              <p className="text-neutral-600 mb-6">Try selecting a different category</p>
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show All Images
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="relative">
            <DialogClose className="absolute top-2 right-2 z-10">
              <Button size="icon" variant="secondary" className="rounded-full bg-white bg-opacity-70 hover:bg-opacity-100">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
            {selectedImage && (
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt} 
                className="w-full h-auto max-h-[80vh] object-contain rounded" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl font-bold mb-6">Join Our Next Event</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            Interested in being part of our musical journey? Register for our upcoming workshops and classes, or attend one of our student performances!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              Upcoming Workshops
            </Button>
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
              View Performance Schedule
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default GalleryPage;
