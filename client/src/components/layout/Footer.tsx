import { Link } from "wouter";
import { FaMusic, FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaArrowRight } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <FaMusic className="text-primary text-2xl mr-3" />
              <span className="font-heading font-bold text-xl">MusicAcademy</span>
            </div>
            <p className="text-neutral-300 mb-6">
              Providing quality music education for all ages and skill levels since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors duration-200">
                <FaFacebookF />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors duration-200">
                <FaInstagram />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors duration-200">
                <FaYoutube />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors duration-200">
                <FaTiktok />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-neutral-300 hover:text-primary transition-colors duration-200">Home</Link></li>
              <li><Link href="/about" className="text-neutral-300 hover:text-primary transition-colors duration-200">About Me</Link></li>
              <li><Link href="/workshops" className="text-neutral-300 hover:text-primary transition-colors duration-200">Workshops</Link></li>
              <li><Link href="/gallery" className="text-neutral-300 hover:text-primary transition-colors duration-200">Gallery</Link></li>
              <li><Link href="/classes" className="text-neutral-300 hover:text-primary transition-colors duration-200">Regular Classes</Link></li>
              <li><Link href="/login" className="text-neutral-300 hover:text-primary transition-colors duration-200">Login/Register</Link></li>
              <li><Link href="/contact" className="text-neutral-300 hover:text-primary transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Our Programs</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Private Lessons</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Group Classes</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Summer Camps</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Recitals & Performances</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Musical Theater</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-primary transition-colors duration-200">Recording Sessions</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Newsletter</h3>
            <p className="text-neutral-300 mb-4">
              Subscribe to get updates on new classes, workshops, and special events.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 py-2 px-4 rounded-l bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary text-white" 
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-r transition-all duration-200"
                >
                  <FaArrowRight />
                </button>
              </div>
            </form>
            <p className="text-xs text-neutral-400">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-neutral-400 text-sm">
                &copy; {new Date().getFullYear()} MusicAcademy. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-neutral-400 hover:text-primary text-sm transition-colors duration-200">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-neutral-400 hover:text-primary text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <a href="#" className="text-neutral-400 hover:text-primary text-sm transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
