import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real application, this would submit to a backend API
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success toast
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - MusicAcademy</title>
        <meta name="description" content="Contact MusicAcademy for inquiries about classes, workshops, or any questions you may have." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Have questions about our classes or workshops? Drop us a message and we'll get back to you soon.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden">
            <div className="w-full md:w-1/2 p-8">
              <h2 className="font-heading text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-inquiry">Class Inquiry</SelectItem>
                      <SelectItem value="workshop-registration">Workshop Registration</SelectItem>
                      <SelectItem value="private-lessons">Private Lessons</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Your message here..." 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : "Send Message"}
                </Button>
              </form>
            </div>
            
            <div className="w-full md:w-1/2 bg-primary p-8 text-white">
              <h3 className="font-heading text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaMapMarkerAlt className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Our Location</h4>
                    <p className="opacity-90">123 Music Street, Suite 101<br />Harmony City, CA 90210</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaPhoneAlt className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Phone</h4>
                    <p className="opacity-90">(123) 456-7890</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="opacity-90">info@musicacademy.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                    <FaClock className="text-lg" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Hours</h4>
                    <p className="opacity-90">
                      Monday - Friday: 9:00 AM - 8:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
                    <FaFacebookF />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
                    <FaInstagram />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
                    <FaYoutube />
                  </a>
                  <a href="#" className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200">
                    <FaTiktok />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our music academy is conveniently located in the heart of the city, easily accessible by public transportation.
            </p>
          </div>
          
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-md">
            {/* Google Maps Embed - Replace with actual Google Maps API in production */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.733248043901!2d-118.34568658478173!3d34.10024862259426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bf20e4c82873%3A0x14015754d926dadb!2sHollywood%20Bowl!5e0!3m2!1sen!2sus!4v1644345116436!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="MusicAcademy Location"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl font-bold mb-6">Want to Visit Us?</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            Schedule a tour of our facilities and meet our instructors. We'd love to show you around and answer any questions you may have about our programs.
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-md">
            Schedule a Tour
          </Button>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
