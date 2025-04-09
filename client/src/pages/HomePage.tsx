import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FaGraduationCap, FaAward, FaUsers, FaMusic, FaCalendar, FaClock, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, textVariant, zoomIn } from "@/lib/animations";
import PageTransition from "@/components/ui/PageTransition";

const HomePage = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>MusicAcademy - Music Workshops and Classes</title>
        <meta name="description" content="Discover music education through workshops and classes at MusicAcademy." />
      </Helmet>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <motion.div 
          className="container mx-auto px-4"
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="w-full md:w-1/2 relative"
              variants={fadeIn("right", 0.5)}
            >
              <img 
                src="https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Music instructor" 
                className="rounded-lg shadow-lg max-w-full md:h-[500px] object-cover" 
              />
              <motion.div 
                className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-lg shadow-lg hidden md:block"
                variants={zoomIn(0.8, 0.6)}
              >
                <p className="text-white font-heading text-xl font-bold">15+ Years</p>
                <p className="text-white opacity-90">Teaching Experience</p>
              </motion.div>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2"
              variants={fadeIn("left", 0.5, 0.3)}
            >
              <motion.h2 
                className="font-accent text-3xl md:text-4xl font-bold mb-6"
                variants={textVariant(0.3)}
              >
                Meet Your Instructor
              </motion.h2>
              <motion.p 
                className="text-neutral-700 mb-6 leading-relaxed"
                variants={fadeIn("up", 0.4, 0.4)}
              >
                Hello! I'm Sarah Miller, a classically trained musician with over 15 years of teaching experience. I founded MusicAcademy with a simple mission: to make quality music education accessible and enjoyable for everyone.
              </motion.p>
              <motion.p 
                className="text-neutral-700 mb-6 leading-relaxed"
                variants={fadeIn("up", 0.4, 0.5)}
              >
                With degrees from Juilliard and the Royal Academy of Music, I bring both technical expertise and a passion for nurturing musical talent in students of all ages and abilities.
              </motion.p>
              <motion.div 
                className="grid grid-cols-2 gap-6 mb-8"
                variants={staggerContainer(0.08, 0.6)}
              >
                <motion.div className="flex items-start" variants={fadeIn("up", 0.3)}>
                  <FaGraduationCap className="text-primary text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold mb-1">Music Education</h4>
                    <p className="text-sm text-neutral-600">Specialized in contemporary and classical instruction</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start" variants={fadeIn("up", 0.3, 0.1)}>
                  <FaAward className="text-primary text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold mb-1">Award-Winning</h4>
                    <p className="text-sm text-neutral-600">Recognized for teaching excellence</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start" variants={fadeIn("up", 0.3, 0.2)}>
                  <FaUsers className="text-primary text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold mb-1">All Ages Welcome</h4>
                    <p className="text-sm text-neutral-600">Tailored instruction for children and adults</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start" variants={fadeIn("up", 0.3, 0.3)}>
                  <FaMusic className="text-primary text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold mb-1">Multiple Instruments</h4>
                    <p className="text-sm text-neutral-600">Piano, guitar, violin, and voice</p>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeIn("up", 0.5, 0.8)}>
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3">
                    Contact Me
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Workshops Preview Section */}
      <section className="py-16 bg-neutral-50">
        <motion.div 
          className="container mx-auto px-4"
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div className="text-center mb-12" variants={fadeIn("up", 0.5)}>
            <motion.h2 
              className="font-accent text-3xl md:text-4xl font-bold mb-4"
              variants={textVariant(0.2)}
            >
              Upcoming Music Workshops
            </motion.h2>
            <motion.p 
              className="text-neutral-600 max-w-2xl mx-auto"
              variants={fadeIn("up", 0.5, 0.3)}
            >
              Dive into our intensive, focused workshop sessions designed to build specific skills and expose you to new musical concepts.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer(0.1, 0.3)}
          >
            {/* Workshop Card 1 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
              variants={fadeIn("up", 0.5, 0.1)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')`}}></div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-primary-light text-white text-xs font-semibold rounded-full mb-3">Guitar</span>
                <h3 className="font-heading text-xl font-bold mb-2">Guitar Fundamentals</h3>
                <p className="text-neutral-600 mb-4">
                  Master the basics of guitar playing from proper posture to chord progressions and simple song performance.
                </p>
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <FaCalendar className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">July 15, 2023</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">2:00 PM - 5:00 PM</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-neutral-800">$45</span>
                    <Link href="/register">
                      <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Workshop Card 2 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
              variants={fadeIn("up", 0.5, 0.2)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url('https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')`}}></div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-primary-light text-white text-xs font-semibold rounded-full mb-3">Piano</span>
                <h3 className="font-heading text-xl font-bold mb-2">Piano for Beginners</h3>
                <p className="text-neutral-600 mb-4">
                  Start your piano journey with this comprehensive workshop covering keyboard basics, notation, and simple pieces.
                </p>
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <FaCalendar className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">July 22, 2023</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">10:00 AM - 1:00 PM</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-neutral-800">$50</span>
                    <Link href="/register">
                      <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Workshop Card 3 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
              variants={fadeIn("up", 0.5, 0.3)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url('https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')`}}></div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-primary-light text-white text-xs font-semibold rounded-full mb-3">Vocal</span>
                <h3 className="font-heading text-xl font-bold mb-2">Finding Your Voice</h3>
                <p className="text-neutral-600 mb-4">
                  Discover your unique vocal style through breathing techniques, range development, and expressive performance.
                </p>
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <FaCalendar className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">August 5, 2023</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-primary mr-2" />
                      <span className="text-sm text-neutral-600">3:00 PM - 6:00 PM</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-neutral-800">$55</span>
                    <Link href="/register">
                      <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 text-center"
            variants={fadeIn("up", 0.5, 0.8)}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Link href="/workshops">
              <Button variant="outline" className="inline-flex items-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-md transition-all duration-200">
                View All Workshops
                <FaArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Classes Preview */}
      <section className="py-16 bg-white">
        <motion.div 
          className="container mx-auto px-4"
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn("up", 0.5)}
          >
            <motion.h2 
              className="font-accent text-3xl md:text-4xl font-bold mb-4"
              variants={textVariant(0.2)}
            >
              Regular Music Classes
            </motion.h2>
            <motion.p 
              className="text-neutral-600 max-w-2xl mx-auto"
              variants={fadeIn("up", 0.4, 0.3)}
            >
              Join our ongoing classes to develop your musical skills through consistent practice and expert guidance.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer(0.1, 0.4)}
          >
            {/* Class Card 1 */}
            <motion.div 
              className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-all duration-200"
              variants={fadeIn("up", 0.4, 0.1)}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">Piano Lessons</h4>
                  <p className="text-neutral-600 text-sm">All skill levels welcome</p>
                </div>
                <motion.span 
                  className="bg-secondary-light text-white text-xs font-bold px-2 py-1 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  Popular
                </motion.span>
              </div>
              <p className="text-neutral-600 text-sm mb-4">
                Weekly private lessons tailored to your skill level and musical interests. From classical to contemporary.
              </p>
              <div className="flex items-center text-sm text-neutral-700 mb-2">
                <FaClock className="text-primary mr-2" />
                <span>30 or 60-minute sessions</span>
              </div>
              <div className="flex items-center text-sm text-neutral-700 mb-4">
                <span className="text-primary mr-2">$</span>
                <span>Starting at $120/month</span>
              </div>
              <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                <span className="text-xs text-neutral-500">Limited spots available</span>
                <Link href="/classes">
                  <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Class Card 2 */}
            <motion.div 
              className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-all duration-200"
              variants={fadeIn("up", 0.4, 0.2)}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">Guitar Lessons</h4>
                  <p className="text-neutral-600 text-sm">Acoustic, Electric, Bass</p>
                </div>
                <motion.span 
                  className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 2 }
                  }}
                >
                  New
                </motion.span>
              </div>
              <p className="text-neutral-600 text-sm mb-4">
                Learn guitar techniques, songs, and theory in personalized one-on-one lessons with expert instructors.
              </p>
              <div className="flex items-center text-sm text-neutral-700 mb-2">
                <FaClock className="text-primary mr-2" />
                <span>45-minute sessions</span>
              </div>
              <div className="flex items-center text-sm text-neutral-700 mb-4">
                <span className="text-primary mr-2">$</span>
                <span>Starting at $140/month</span>
              </div>
              <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                <span className="text-xs text-neutral-500">Instruments available</span>
                <Link href="/classes">
                  <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Class Card 3 */}
            <motion.div 
              className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-all duration-200"
              variants={fadeIn("up", 0.4, 0.3)}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">Vocal Training</h4>
                  <p className="text-neutral-600 text-sm">Find your unique voice</p>
                </div>
              </div>
              <p className="text-neutral-600 text-sm mb-4">
                Develop your vocal abilities through personalized instruction focused on technique, range, and performance.
              </p>
              <div className="flex items-center text-sm text-neutral-700 mb-2">
                <FaClock className="text-primary mr-2" />
                <span>45-minute sessions</span>
              </div>
              <div className="flex items-center text-sm text-neutral-700 mb-4">
                <span className="text-primary mr-2">$</span>
                <span>Starting at $150/month</span>
              </div>
              <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                <span className="text-xs text-neutral-500">All ages welcome</span>
                <Link href="/classes">
                  <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 text-center"
            variants={fadeIn("up", 0.5, 0.8)}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Link href="/classes">
              <Button variant="outline" className="inline-flex items-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-md transition-all duration-200">
                Explore All Classes
                <FaArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Registration CTA */}
      <section className="py-16 bg-neutral-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Musical Journey?</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            Register now to join our community of musicians and start learning with our expert instructors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-md">
                Register Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="bg-transparent border-2 border-white hover:bg-white hover:text-neutral-800 text-white font-medium px-8 py-3 rounded-md">
                Contact Us
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <FaCheckCircle className="text-primary text-xl mt-1 mr-3" />
              <div className="text-left">
                <h4 className="font-bold mb-1">Flexible Scheduling</h4>
                <p className="text-sm text-neutral-300">Classes available weekdays, evenings, and weekends</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-primary text-xl mt-1 mr-3" />
              <div className="text-left">
                <h4 className="font-bold mb-1">Expert Instruction</h4>
                <p className="text-sm text-neutral-300">Learn from professional, experienced musicians</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-primary text-xl mt-1 mr-3" />
              <div className="text-left">
                <h4 className="font-bold mb-1">Supportive Environment</h4>
                <p className="text-sm text-neutral-300">Develop your skills in a positive, encouraging atmosphere</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default HomePage;
