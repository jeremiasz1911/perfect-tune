import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getUserByUid } from "@/lib/db";
import { FaMusic } from "react-icons/fa";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userData = await getUserByUid(user.uid);
          if (userData) {
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Me" },
    { href: "/workshops", label: "Workshops" },
    { href: "/gallery", label: "Gallery" },
    { href: "/classes", label: "Regular Classes" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className={`bg-white sticky top-0 z-50 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <FaMusic className="text-primary text-2xl mr-3" />
              <span className="font-heading font-bold text-xl text-neutral-800">MusicAcademy</span>
            </Link>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium ${
                  isActive(link.href) ? 'text-primary' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="relative ml-4">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {user.email?.split('@')[0]}
                  <ChevronDown size={16} />
                </Button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/parent'}>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </a>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button className="ml-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              className="text-neutral-600 hover:text-primary"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Nav Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link 
                  href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/parent'}
                  className="block px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <a className="block mt-2 px-4 py-2 text-white bg-primary hover:bg-primary-dark rounded-md text-center"
                   onClick={() => setIsMenuOpen(false)}>
                  Login
                </a>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
