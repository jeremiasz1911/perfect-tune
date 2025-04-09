import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FaMusic, FaGuitar, FaPiano, FaMicrophone, FaDrum, FaViolin, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

interface ChildData {
  id: string;
  name: string;
  surname: string;
  age: number;
}

interface ClassData {
  id: string;
  childId: string;
  childName: string;
  className: string;
  schedule: string;
  location: string;
  status: string;
  nextClass: string;
  attendance: number;
}

interface AvailableClass {
  id: string;
  name: string;
  type: string;
  description: string;
  instructor: string;
  schedule: string;
  location: string;
  ageRange: string;
  price: number;
  capacity: number;
  spotsLeft: number;
}

interface ClassRegistrationProps {
  children: ChildData[];
  classes: ClassData[];
}

const ClassRegistration = ({ children, classes }: ClassRegistrationProps) => {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [activeTab, setActiveTab] = useState("enrolled");
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classTypeFilter, setClassTypeFilter] = useState<string>("all");
  
  const { toast } = useToast();

  // Get the available classes (mock data for now)
  useEffect(() => {
    // In a real application, this data would come from Firebase
    const mockAvailableClasses: AvailableClass[] = [
      {
        id: "class1",
        name: "Piano Fundamentals",
        type: "instrument",
        description: "Learn the basics of piano playing, including proper technique, note reading, and simple songs.",
        instructor: "Sarah Miller",
        schedule: "Tuesdays, 4:00 PM - 5:00 PM",
        location: "Room 101",
        ageRange: "7-12",
        price: 120,
        capacity: 8,
        spotsLeft: 3
      },
      {
        id: "class2",
        name: "Guitar for Beginners",
        type: "instrument",
        description: "Start your guitar journey with proper technique, basic chords, and strumming patterns.",
        instructor: "Michael Johnson",
        schedule: "Mondays, 5:00 PM - 6:00 PM",
        location: "Room 105",
        ageRange: "8-14",
        price: 130,
        capacity: 8,
        spotsLeft: 2
      },
      {
        id: "class3",
        name: "Music Theory for Kids",
        type: "theory",
        description: "A fun way to learn musical concepts, notation, rhythm, and ear training through games and activities.",
        instructor: "Emily Davis",
        schedule: "Thursdays, 5:00 PM - 6:00 PM",
        location: "Room 203",
        ageRange: "7-12",
        price: 95,
        capacity: 10,
        spotsLeft: 4
      },
      {
        id: "class4",
        name: "Vocal Training",
        type: "vocal",
        description: "Develop proper breathing techniques, vocal control, and expression through fun vocal exercises.",
        instructor: "Laura Wilson",
        schedule: "Wednesdays, 4:30 PM - 5:30 PM",
        location: "Room 202",
        ageRange: "9-15",
        price: 110,
        capacity: 8,
        spotsLeft: 3
      },
      {
        id: "class5",
        name: "Rock Band Workshop",
        type: "ensemble",
        description: "Learn to play in a band setting, focusing on rhythm, listening skills, and performance techniques.",
        instructor: "James Brown",
        schedule: "Fridays, 4:00 PM - 6:00 PM",
        location: "Room 108",
        ageRange: "12-16",
        price: 150,
        capacity: 10,
        spotsLeft: 5
      }
    ];
    
    setAvailableClasses(mockAvailableClasses);
  }, []);

  const handleRegister = async () => {
    if (!selectedChild) {
      toast({
        title: "Child Not Selected",
        description: "Please select a child before enrolling in a class.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedClass) return;
    
    setIsRegistering(true);
    try {
      // In a real application, this would enroll the child in Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Enrollment Successful",
        description: `${getChildName(selectedChild)} has been enrolled in ${selectedClass.name}.`,
      });
      
      setIsDialogOpen(false);
      // In a real application, you would refresh the classes list here
    } catch (error) {
      console.error("Error enrolling in class:", error);
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTransfer = async (classId: string) => {
    // Implementation for transferring a child to a different class/group
    toast({
      title: "Feature Coming Soon",
      description: "The ability to transfer between classes will be available in the next update.",
    });
  };

  const handleUnenroll = async (classId: string, childId: string) => {
    if (!confirm("Are you sure you want to unenroll from this class?")) {
      return;
    }
    
    try {
      // In a real application, this would unenroll the child from the class in Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Unenrollment Successful",
        description: "Your child has been unenrolled from the class.",
      });
      
      // In a real application, you would refresh the classes list here
    } catch (error) {
      console.error("Error unenrolling from class:", error);
      toast({
        title: "Unenrollment Failed",
        description: "There was an error unenrolling from the class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getChildName = (childId: string): string => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.name} ${child.surname}` : "Unknown Child";
  };

  const getChildClasses = (childId: string): ClassData[] => {
    return classes.filter(c => c.childId === childId);
  };

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case "instrument":
        return <FaGuitar className="text-primary" />;
      case "vocal":
        return <FaMicrophone className="text-primary" />;
      case "theory":
        return <FaMusic className="text-primary" />;
      case "ensemble":
        return <FaDrum className="text-primary" />;
      default:
        return <FaMusic className="text-primary" />;
    }
  };

  const filteredAvailableClasses = classTypeFilter === "all"
    ? availableClasses
    : availableClasses.filter(c => c.type === classTypeFilter);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Class Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Select a Child</CardTitle>
            <CardDescription>
              Choose a child to view their classes or register for new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} {child.surname} (Age: {child.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedChild && (
        <div>
          <h3 className="text-xl font-semibold mb-4">{getChildName(selectedChild)}'s Classes</h3>
          
          <Tabs defaultValue="enrolled" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="enrolled">Enrolled Classes</TabsTrigger>
              <TabsTrigger value="available">Available Classes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="enrolled">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getChildClasses(selectedChild).length > 0 ? (
                  getChildClasses(selectedChild).map((classItem) => (
                    <Card key={classItem.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{classItem.className}</CardTitle>
                          <Badge variant={classItem.status === "Active" ? "default" : "secondary"}>
                            {classItem.status}
                          </Badge>
                        </div>
                        <CardDescription>{classItem.schedule}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-primary mr-2" size={14} />
                            <span className="text-sm">{classItem.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-primary mr-2" size={14} />
                            <span className="text-sm">Next class: {classItem.nextClass}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMusic className="text-primary mr-2" size={14} />
                            <span className="text-sm">Attendance: {classItem.attendance}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTransfer(classItem.id)}
                        >
                          Transfer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleUnenroll(classItem.id, selectedChild)}
                        >
                          Unenroll
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 text-center bg-neutral-50 rounded-lg">
                    <FaMusic className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Classes Enrolled</h3>
                    <p className="text-neutral-600 mb-4">
                      {getChildName(selectedChild)} is not currently enrolled in any classes.
                    </p>
                    <Button onClick={() => setActiveTab("available")}>
                      Browse Available Classes
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="available">
              <div className="mb-6">
                <h4 className="font-medium mb-2">Filter by Class Type</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={classTypeFilter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setClassTypeFilter("all")}
                    className={classTypeFilter === "all" ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    All Classes
                  </Button>
                  <Button 
                    variant={classTypeFilter === "instrument" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setClassTypeFilter("instrument")}
                    className={classTypeFilter === "instrument" ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    <FaGuitar className="mr-2" size={12} />
                    Instrument
                  </Button>
                  <Button 
                    variant={classTypeFilter === "vocal" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setClassTypeFilter("vocal")}
                    className={classTypeFilter === "vocal" ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    <FaMicrophone className="mr-2" size={12} />
                    Vocal
                  </Button>
                  <Button 
                    variant={classTypeFilter === "theory" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setClassTypeFilter("theory")}
                    className={classTypeFilter === "theory" ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    <FaMusic className="mr-2" size={12} />
                    Theory
                  </Button>
                  <Button 
                    variant={classTypeFilter === "ensemble" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setClassTypeFilter("ensemble")}
                    className={classTypeFilter === "ensemble" ? "bg-primary hover:bg-primary-dark" : ""}
                  >
                    <FaDrum className="mr-2" size={12} />
                    Ensemble
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAvailableClasses.length > 0 ? (
                  filteredAvailableClasses.map((classItem) => (
                    <Card key={classItem.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getClassTypeIcon(classItem.type)}
                            <CardTitle className="ml-2">{classItem.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary">
                            {classItem.spotsLeft} spots left
                          </Badge>
                        </div>
                        <CardDescription>{classItem.instructor}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-neutral-600 mb-3">
                          {classItem.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <FaClock className="text-primary mr-2" size={14} />
                            <span>{classItem.schedule}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-primary mr-2" size={14} />
                            <span>{classItem.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMusic className="text-primary mr-2" size={14} />
                            <span>Ages {classItem.ageRange}</span>
                          </div>
                          <div className="flex items-center">
                            <FaDollarSign className="text-primary mr-2" size={14} />
                            <span>${classItem.price}/month</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t">
                        <Dialog open={isDialogOpen && selectedClass?.id === classItem.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedClass(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full"
                              onClick={() => setSelectedClass(classItem)}
                            >
                              Enroll Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Enrollment</DialogTitle>
                              <DialogDescription>
                                You are about to enroll {getChildName(selectedChild)} in {classItem.name}.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-4">
                              <div className="bg-neutral-50 p-4 rounded-lg space-y-2 mb-4">
                                <div className="flex justify-between">
                                  <span className="font-medium">Class:</span>
                                  <span>{classItem.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Schedule:</span>
                                  <span>{classItem.schedule}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Location:</span>
                                  <span>{classItem.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Monthly Fee:</span>
                                  <span className="font-bold">${classItem.price}.00</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-neutral-600">
                                By clicking "Confirm Enrollment," you agree to our terms and conditions, including our payment and cancellation policies.
                              </p>
                            </div>
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isRegistering}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleRegister}
                                disabled={isRegistering}
                              >
                                {isRegistering ? (
                                  <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enrolling...
                                  </div>
                                ) : (
                                  "Confirm Enrollment"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 text-center bg-neutral-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
                    <p className="text-neutral-600">
                      There are no available classes matching your filter criteria.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setClassTypeFilter("all")}
                    >
                      View All Classes
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {!selectedChild && (
        <div className="p-8 text-center bg-neutral-50 rounded-lg">
          <FaMusic className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Child Selected</h3>
          <p className="text-neutral-600 mb-4">
            Please select a child above to view their classes or register for new ones.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassRegistration;
