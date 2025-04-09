import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaGraduationCap, FaAward, FaUsers, FaMusic } from "react-icons/fa";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Me - MusicAcademy</title>
        <meta name="description" content="Learn about the founder and instructor of MusicAcademy, their experience, and teaching philosophy." />
      </Helmet>

      <section className="pt-16 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">About Our Founder</h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Meet the passionate musician and educator behind MusicAcademy
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-full md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Music instructor" 
                className="rounded-lg shadow-lg max-w-full md:h-[500px] object-cover" 
              />
              <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-lg shadow-lg hidden md:block">
                <p className="text-white font-heading text-xl font-bold">15+ Years</p>
                <p className="text-white opacity-90">Teaching Experience</p>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="font-accent text-3xl md:text-4xl font-bold mb-6">Sarah Miller</h2>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                Hello! I'm Sarah Miller, a classically trained musician with over 15 years of teaching experience. I founded MusicAcademy in 2010 with a simple mission: to make quality music education accessible and enjoyable for everyone.
              </p>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                With degrees from Juilliard and the Royal Academy of Music, I bring both technical expertise and a passion for nurturing musical talent in students of all ages and abilities. My approach to teaching focuses on building a strong foundation while encouraging creativity and self-expression.
              </p>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                Throughout my career, I've had the privilege of performing with orchestras around the world and training hundreds of students, many of whom have gone on to pursue music professionally. I believe that music education should be a joyful journey, and I'm committed to creating a supportive environment where every student can thrive.
              </p>

              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3">
                  Contact Me
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <FaGraduationCap className="text-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Music Education</h3>
              <p className="text-neutral-600">
                Dual degrees in Performance and Education from world-renowned institutions, with additional certifications in early childhood music education.
              </p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <FaAward className="text-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Award-Winning</h3>
              <p className="text-neutral-600">
                Recipient of multiple teaching excellence awards, including the National Music Educator Award and Community Arts Leadership recognition.
              </p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">All Ages Welcome</h3>
              <p className="text-neutral-600">
                Experienced in teaching students from age 3 to 80+, with specialized programs for early childhood, youth, adult, and senior students.
              </p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <FaMusic className="text-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">Multiple Instruments</h3>
              <p className="text-neutral-600">
                Primary expertise in piano and violin, with additional proficiency in guitar, voice, and music theory instruction across various genres.
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 p-8 md:p-12 rounded-xl">
            <h2 className="font-accent text-3xl font-bold mb-6 text-center">Our Teaching Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Personalized Approach</h3>
                <p className="text-neutral-700 mb-4">
                  We believe every student is unique. Our instruction adapts to individual learning styles, goals, and interests. Whether you're pursuing music professionally or for personal enjoyment, we tailor our approach to help you succeed.
                </p>
                <p className="text-neutral-700">
                  Our small class sizes and one-on-one lessons ensure that each student receives the attention they deserve, with regular progress assessments and personalized feedback.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4">Balance of Technique and Creativity</h3>
                <p className="text-neutral-700 mb-4">
                  While we emphasize strong technical foundations, we equally value creative expression. Students learn proper technique alongside improvisation, composition, and performance skills.
                </p>
                <p className="text-neutral-700">
                  We incorporate a variety of musical styles and genres, encouraging students to explore beyond their comfort zones while developing their unique musical voice.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4">Supportive Community</h3>
                <p className="text-neutral-700 mb-4">
                  Learning music thrives in a supportive environment. We foster a community where students can collaborate, share their progress, and learn from each other.
                </p>
                <p className="text-neutral-700">
                  Regular recitals, workshops, and group classes provide opportunities for students to build confidence, overcome performance anxiety, and celebrate achievements together.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4">Lifelong Musical Journey</h3>
                <p className="text-neutral-700 mb-4">
                  We view music education as a lifelong journey. Beyond teaching specific skills, we aim to instill a lasting love of music that continues long after formal lessons end.
                </p>
                <p className="text-neutral-700">
                  Students develop self-discipline, critical listening, problem-solving, and self-expression skills that extend beyond music into all areas of life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl md:text-4xl font-bold mb-6">Join Our Musical Community Today</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            Whether you're completely new to music or looking to advance your skills, we have the perfect program for you. Experience the joy of learning music in a supportive, inspiring environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-md">
                Register Now
              </Button>
            </Link>
            <Link href="/classes">
              <Button variant="outline" className="bg-transparent border-2 border-white hover:bg-white hover:text-neutral-800 text-white font-medium px-8 py-3 rounded-md">
                Explore Our Classes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
