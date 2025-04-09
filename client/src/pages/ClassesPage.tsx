import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { getClasses } from "@/lib/db";
import { FaGuitar, FaChild, FaMicrophone, FaFileAlt, FaHeadphones, FaClock, FaDollarSign } from "react-icons/fa";

// Class data types
interface InstrumentClass {
  id: string;
  name: string;
  description: string;
  level: string;
  badge?: string;
  sessionLength: string;
  price: number;
  note?: string;
}

const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState("instruments");
  
  // Instrument classes
  const instrumentClasses: InstrumentClass[] = [
    {
      id: "piano",
      name: "Piano Lessons",
      description: "Weekly private lessons tailored to your skill level and musical interests. From classical to contemporary.",
      level: "All skill levels welcome",
      badge: "Popular",
      sessionLength: "30 or 60-minute sessions",
      price: 120,
      note: "Limited spots available"
    },
    {
      id: "guitar",
      name: "Guitar Lessons",
      description: "Learn guitar techniques, songs, and theory in personalized one-on-one lessons with expert instructors.",
      level: "Acoustic, Electric, Bass",
      badge: "New",
      sessionLength: "45-minute sessions",
      price: 140,
      note: "Instruments available"
    },
    {
      id: "violin",
      name: "Violin Lessons",
      description: "Master the violin with dedicated instruction focusing on proper technique, tone, and repertoire development.",
      level: "Classical and contemporary",
      sessionLength: "45-minute sessions",
      price: 150,
      note: "Rental options available"
    },
    {
      id: "drums",
      name: "Drum Lessons",
      description: "Develop your rhythmic skills, coordination, and musical expression through personalized drum instruction.",
      level: "Rhythm and percussion",
      sessionLength: "45-minute sessions",
      price: 130,
      note: "Practice pads included"
    }
  ];

  // Children's music classes
  const childrenClasses: InstrumentClass[] = [
    {
      id: "music-explorers",
      name: "Music Explorers",
      description: "A fun introduction to music for young children, exploring rhythm, melody, and various instruments through games and activities.",
      level: "Ages 3-5",
      badge: "Popular",
      sessionLength: "45-minute group sessions",
      price: 95,
      note: "Parent participation encouraged"
    },
    {
      id: "junior-musicians",
      name: "Junior Musicians",
      description: "Build musical foundations with this comprehensive program covering basic theory, ear training, and introductory instrument skills.",
      level: "Ages 6-8",
      sessionLength: "60-minute group sessions",
      price: 110,
      note: "Materials included"
    },
    {
      id: "youth-ensemble",
      name: "Youth Ensemble",
      description: "Collaborative music-making for children who have some musical experience, focusing on playing together as a group.",
      level: "Ages 9-12 with basic skills",
      sessionLength: "90-minute weekly sessions",
      price: 130,
      note: "Performances twice yearly"
    }
  ];

  // Vocal classes
  const vocalClasses: InstrumentClass[] = [
    {
      id: "private-voice",
      name: "Private Voice Lessons",
      description: "One-on-one vocal training tailored to your voice type, style preferences, and experience level.",
      level: "All levels",
      sessionLength: "45-minute sessions",
      price: 145,
      note: "Recording options available"
    },
    {
      id: "choir",
      name: "Community Choir",
      description: "Join our non-auditioned choir to experience the joy of singing in harmony with others. All voices welcome!",
      level: "No experience needed",
      badge: "New",
      sessionLength: "2-hour weekly sessions",
      price: 75,
      note: "Public performances"
    },
    {
      id: "vocal-techniques",
      name: "Vocal Techniques Workshop",
      description: "Focus on specific vocal techniques including breathing, projection, range extension, and stylistic expression.",
      level: "Intermediate to advanced",
      sessionLength: "90-minute sessions",
      price: 120,
      note: "Small group format"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Regular Classes - MusicAcademy</title>
        <meta name="description" content="Explore our regular music classes for all ages and skill levels at MusicAcademy." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4">Regular Music Classes</h1>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Join our ongoing classes to develop your musical skills through consistent practice and expert guidance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-primary p-8 text-white">
                <h3 className="font-heading text-2xl font-bold mb-6">Class Categories</h3>
                <Tabs defaultValue="instruments" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-1 bg-transparent h-auto">
                    <TabsTrigger 
                      value="instruments" 
                      className={`flex items-center justify-start py-2 px-4 mb-2 rounded-md ${activeTab === 'instruments' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark hover:text-white transition-all duration-200'}`}
                    >
                      <FaGuitar className="mr-3" />
                      <span>Instrument Lessons</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="children" 
                      className={`flex items-center justify-start py-2 px-4 mb-2 rounded-md ${activeTab === 'children' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark hover:text-white transition-all duration-200'}`}
                    >
                      <FaChild className="mr-3" />
                      <span>Children's Music</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="vocal" 
                      className={`flex items-center justify-start py-2 px-4 mb-2 rounded-md ${activeTab === 'vocal' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark hover:text-white transition-all duration-200'}`}
                    >
                      <FaMicrophone className="mr-3" />
                      <span>Vocal Training</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="theory" 
                      className={`flex items-center justify-start py-2 px-4 mb-2 rounded-md ${activeTab === 'theory' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark hover:text-white transition-all duration-200'}`}
                    >
                      <FaFileAlt className="mr-3" />
                      <span>Music Theory</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recording" 
                      className={`flex items-center justify-start py-2 px-4 mb-2 rounded-md ${activeTab === 'recording' ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark hover:text-white transition-all duration-200'}`}
                    >
                      <FaHeadphones className="mr-3" />
                      <span>Recording Arts</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="mt-8">
                  <h4 className="font-bold mb-2">Need help choosing?</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Schedule a free consultation to find the perfect class for you or your child.
                  </p>
                  <Link href="/contact">
                    <Button className="inline-block bg-white text-primary hover:bg-neutral-100">
                      Book Consultation
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 p-8">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="instruments" className="mt-0">
                    <h3 className="font-heading text-2xl font-bold mb-6">Instrument Lessons</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {instrumentClasses.map((classItem) => (
                        <Card key={classItem.id} className="border border-neutral-200 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{classItem.name}</h4>
                                <p className="text-neutral-600 text-sm">{classItem.level}</p>
                              </div>
                              {classItem.badge && (
                                <span className={`bg-${classItem.badge === 'Popular' ? 'secondary-light' : 'accent'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                                  {classItem.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-600 text-sm mb-4">
                              {classItem.description}
                            </p>
                            <div className="flex items-center text-sm text-neutral-700 mb-2">
                              <FaClock className="text-primary mr-2" />
                              <span>{classItem.sessionLength}</span>
                            </div>
                            <div className="flex items-center text-sm text-neutral-700 mb-4">
                              <FaDollarSign className="text-primary mr-2" />
                              <span>Starting at ${classItem.price}/month</span>
                            </div>
                            <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                              <span className="text-xs text-neutral-500">{classItem.note}</span>
                              <Link href="/register">
                                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                                  Enroll Now
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="children" className="mt-0">
                    <h3 className="font-heading text-2xl font-bold mb-6">Children's Music</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {childrenClasses.map((classItem) => (
                        <Card key={classItem.id} className="border border-neutral-200 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{classItem.name}</h4>
                                <p className="text-neutral-600 text-sm">{classItem.level}</p>
                              </div>
                              {classItem.badge && (
                                <span className={`bg-${classItem.badge === 'Popular' ? 'secondary-light' : 'accent'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                                  {classItem.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-600 text-sm mb-4">
                              {classItem.description}
                            </p>
                            <div className="flex items-center text-sm text-neutral-700 mb-2">
                              <FaClock className="text-primary mr-2" />
                              <span>{classItem.sessionLength}</span>
                            </div>
                            <div className="flex items-center text-sm text-neutral-700 mb-4">
                              <FaDollarSign className="text-primary mr-2" />
                              <span>Starting at ${classItem.price}/month</span>
                            </div>
                            <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                              <span className="text-xs text-neutral-500">{classItem.note}</span>
                              <Link href="/register">
                                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                                  Enroll Now
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="vocal" className="mt-0">
                    <h3 className="font-heading text-2xl font-bold mb-6">Vocal Training</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {vocalClasses.map((classItem) => (
                        <Card key={classItem.id} className="border border-neutral-200 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{classItem.name}</h4>
                                <p className="text-neutral-600 text-sm">{classItem.level}</p>
                              </div>
                              {classItem.badge && (
                                <span className={`bg-${classItem.badge === 'Popular' ? 'secondary-light' : 'accent'} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                                  {classItem.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-600 text-sm mb-4">
                              {classItem.description}
                            </p>
                            <div className="flex items-center text-sm text-neutral-700 mb-2">
                              <FaClock className="text-primary mr-2" />
                              <span>{classItem.sessionLength}</span>
                            </div>
                            <div className="flex items-center text-sm text-neutral-700 mb-4">
                              <FaDollarSign className="text-primary mr-2" />
                              <span>Starting at ${classItem.price}/month</span>
                            </div>
                            <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                              <span className="text-xs text-neutral-500">{classItem.note}</span>
                              <Link href="/register">
                                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm">
                                  Enroll Now
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="theory" className="mt-0">
                    <h3 className="font-heading text-2xl font-bold mb-6">Music Theory</h3>
                    <div className="p-8 text-center">
                      <p className="text-neutral-600 mb-6">Our music theory classes will be available soon. Please check back later or leave your contact information to be notified when they become available.</p>
                      <Link href="/contact">
                        <Button className="bg-primary hover:bg-primary-dark text-white">
                          Register Interest
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>

                  <TabsContent value="recording" className="mt-0">
                    <h3 className="font-heading text-2xl font-bold mb-6">Recording Arts</h3>
                    <div className="p-8 text-center">
                      <p className="text-neutral-600 mb-6">Our recording arts classes will be available soon. Please check back later or leave your contact information to be notified when they become available.</p>
                      <Link href="/contact">
                        <Button className="bg-primary hover:bg-primary-dark text-white">
                          Register Interest
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-8 text-center">
                  <Link href="/contact" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                    Have questions about our classes? Contact us <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl font-bold mb-4">How Our Classes Work</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our structured approach ensures that students get the most out of their musical education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
              <h3 className="font-bold text-xl mb-2">Assessment</h3>
              <p className="text-neutral-600">
                We begin with an assessment to understand your current skill level, musical interests, and learning style.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
              <h3 className="font-bold text-xl mb-2">Personalized Plan</h3>
              <p className="text-neutral-600">
                Your instructor creates a customized curriculum tailored to your specific goals and learning pace.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
              <h3 className="font-bold text-xl mb-2">Regular Sessions</h3>
              <p className="text-neutral-600">
                Attend weekly lessons where you'll learn new skills, receive feedback, and get guided practice.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
              <h3 className="font-bold text-xl mb-2">Progress & Performance</h3>
              <p className="text-neutral-600">
                Track your growth with regular progress reports and showcase your skills in optional recitals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl font-bold mb-6">Ready to Start Your Musical Journey?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Enroll in our classes today and discover the joy of making music. No prior experience necessary - just bring your enthusiasm!
          </p>
          <Link href="/register">
            <Button className="bg-white text-primary hover:bg-neutral-100 font-medium px-8 py-3">
              Enroll Now
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default ClassesPage;
