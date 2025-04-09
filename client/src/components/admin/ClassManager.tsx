import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaFilter, 
  FaCalendarAlt, 
  FaUserAlt, 
  FaMapMarkerAlt, 
  FaClock,
  FaMusic,
  FaGuitar,
  FaMicrophone,
  FaChalkboardTeacher,
  FaUsers,
  FaDollarSign
} from "react-icons/fa";

// Mock class data types
interface ClassData {
  id: string;
  name: string;
  type: string;
  description: string;
  instructor: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  location: string;
  capacity: number;
  enrolledStudents: number;
  price: number;
  ageRange: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface ClassStudentData {
  id: string;
  name: string;
  age: number;
  parent: string;
  email: string;
  attendance: number;
  status: string;
}

const ClassManager = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isViewStudentsDialogOpen, setIsViewStudentsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new/edit class
  const [className, setClassName] = useState("");
  const [classType, setClassType] = useState("instrument");
  const [classDescription, setClassDescription] = useState("");
  const [classInstructor, setClassInstructor] = useState("");
  const [classDays, setClassDays] = useState<string[]>([]);
  const [classStartTime, setClassStartTime] = useState("");
  const [classEndTime, setClassEndTime] = useState("");
  const [classLocation, setClassLocation] = useState("");
  const [classCapacity, setClassCapacity] = useState("");
  const [classPrice, setClassPrice] = useState("");
  const [classAgeRange, setClassAgeRange] = useState("");
  const [classStartDate, setClassStartDate] = useState("");
  const [classEndDate, setClassEndDate] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, typeFilter, statusFilter, classes]);

  const fetchClasses = async () => {
    try {
      // In a real application, this would fetch classes from Firebase
      const mockClasses: ClassData[] = [
        {
          id: "1",
          name: "Piano Fundamentals",
          type: "instrument",
          description: "A beginner piano class covering basic techniques, note reading, and simple songs.",
          instructor: "Sarah Miller",
          schedule: {
            days: ["Tuesday", "Thursday"],
            startTime: "16:00",
            endTime: "17:00"
          },
          location: "Room 101",
          capacity: 8,
          enrolledStudents: 5,
          price: 120,
          ageRange: "7-12",
          status: "active",
          startDate: "2023-06-15"
        },
        {
          id: "2",
          name: "Guitar for Beginners",
          type: "instrument",
          description: "Introduction to guitar playing including basic chords, strumming patterns, and simple songs.",
          instructor: "Michael Johnson",
          schedule: {
            days: ["Monday", "Wednesday"],
            startTime: "17:00",
            endTime: "18:00"
          },
          location: "Room 105",
          capacity: 10,
          enrolledStudents: 8,
          price: 130,
          ageRange: "8-14",
          status: "active",
          startDate: "2023-06-12"
        },
        {
          id: "3",
          name: "Music Theory for Kids",
          type: "theory",
          description: "Fun and interactive exploration of music theory concepts, notation, and rhythm for children.",
          instructor: "Emily Davis",
          schedule: {
            days: ["Thursday"],
            startTime: "17:00",
            endTime: "18:00"
          },
          location: "Room 203",
          capacity: 12,
          enrolledStudents: 8,
          price: 95,
          ageRange: "7-12",
          status: "active",
          startDate: "2023-06-15"
        },
        {
          id: "4",
          name: "Vocal Training",
          type: "vocal",
          description: "Develop proper singing techniques, breath control, and vocal range in this comprehensive class.",
          instructor: "Laura Wilson",
          schedule: {
            days: ["Wednesday", "Friday"],
            startTime: "16:30",
            endTime: "17:30"
          },
          location: "Room 202",
          capacity: 8,
          enrolledStudents: 5,
          price: 110,
          ageRange: "9-15",
          status: "active",
          startDate: "2023-06-14"
        },
        {
          id: "5",
          name: "Advanced Piano",
          type: "instrument",
          description: "For intermediate to advanced piano students looking to refine their skills and expand their repertoire.",
          instructor: "Sarah Miller",
          schedule: {
            days: ["Monday", "Friday"],
            startTime: "18:00",
            endTime: "19:30"
          },
          location: "Room 101",
          capacity: 6,
          enrolledStudents: 4,
          price: 150,
          ageRange: "12-18",
          status: "active",
          startDate: "2023-06-12"
        },
        {
          id: "6",
          name: "Summer Rock Band",
          type: "ensemble",
          description: "A summer workshop for students to form rock bands, learn popular songs, and perform together.",
          instructor: "James Brown",
          schedule: {
            days: ["Monday", "Wednesday", "Friday"],
            startTime: "14:00",
            endTime: "16:00"
          },
          location: "Room 108",
          capacity: 15,
          enrolledStudents: 0,
          price: 180,
          ageRange: "12-16",
          status: "upcoming",
          startDate: "2023-07-10",
          endDate: "2023-08-18"
        }
      ];
      
      setClasses(mockClasses);
      setFilteredClasses(mockClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchClassStudents = async (classId: string) => {
    try {
      // In a real application, this would fetch students from Firebase
      const mockStudents: ClassStudentData[] = [
        {
          id: "s1",
          name: "Emma Johnson",
          age: 8,
          parent: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          attendance: 92,
          status: "active"
        },
        {
          id: "s2",
          name: "Jack Smith",
          age: 10,
          parent: "John Smith",
          email: "john.smith@example.com",
          attendance: 85,
          status: "active"
        },
        {
          id: "s3",
          name: "Olivia Davis",
          age: 9,
          parent: "Michael Davis",
          email: "michael.davis@example.com",
          attendance: 95,
          status: "active"
        },
        {
          id: "s4",
          name: "Noah Wilson",
          age: 11,
          parent: "Jennifer Wilson",
          email: "jennifer.wilson@example.com",
          attendance: 88,
          status: "active"
        },
        {
          id: "s5",
          name: "Sophia Brown",
          age: 7,
          parent: "Robert Brown",
          email: "robert.brown@example.com",
          attendance: 78,
          status: "active"
        }
      ];
      
      setClassStudents(mockStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let result = [...classes];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(classItem => 
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(classItem => classItem.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(classItem => classItem.status === statusFilter);
    }
    
    setFilteredClasses(result);
  };

  const resetClassForm = () => {
    setClassName("");
    setClassType("instrument");
    setClassDescription("");
    setClassInstructor("");
    setClassDays([]);
    setClassStartTime("");
    setClassEndTime("");
    setClassLocation("");
    setClassCapacity("");
    setClassPrice("");
    setClassAgeRange("");
    setClassStartDate("");
    setClassEndDate("");
  };

  const handleOpenAddClassDialog = () => {
    resetClassForm();
    setIsAddClassDialogOpen(true);
  };

  const handleOpenEditClassDialog = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setClassName(classItem.name);
    setClassType(classItem.type);
    setClassDescription(classItem.description);
    setClassInstructor(classItem.instructor);
    setClassDays(classItem.schedule.days);
    setClassStartTime(classItem.schedule.startTime);
    setClassEndTime(classItem.schedule.endTime);
    setClassLocation(classItem.location);
    setClassCapacity(classItem.capacity.toString());
    setClassPrice(classItem.price.toString());
    setClassAgeRange(classItem.ageRange);
    setClassStartDate(classItem.startDate);
    setClassEndDate(classItem.endDate || "");
    setIsEditClassDialogOpen(true);
  };

  const handleViewStudents = (classItem: ClassData) => {
    setSelectedClass(classItem);
    fetchClassStudents(classItem.id);
    setIsViewStudentsDialogOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return;
    }
    
    try {
      // In a real application, this would delete the class from Firebase
      // For now, we'll just remove it from the local state
      setClasses(classes.filter(c => c.id !== classId));
      toast({
        title: "Class Deleted",
        description: "The class has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDayToggle = (day: string) => {
    if (classDays.includes(day)) {
      setClassDays(classDays.filter(d => d !== day));
    } else {
      setClassDays([...classDays, day]);
    }
  };

  const handleAddClass = async () => {
    if (!validateClassForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real application, this would add the class to Firebase
      const newClass: ClassData = {
        id: Date.now().toString(),
        name: className,
        type: classType,
        description: classDescription,
        instructor: classInstructor,
        schedule: {
          days: classDays,
          startTime: classStartTime,
          endTime: classEndTime
        },
        location: classLocation,
        capacity: parseInt(classCapacity),
        enrolledStudents: 0,
        price: parseInt(classPrice),
        ageRange: classAgeRange,
        status: new Date(classStartDate) > new Date() ? "upcoming" : "active",
        startDate: classStartDate,
        endDate: classEndDate || undefined
      };
      
      setClasses([...classes, newClass]);
      resetClassForm();
      setIsAddClassDialogOpen(false);
      
      toast({
        title: "Class Added",
        description: "The class has been successfully added.",
      });
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!validateClassForm() || !selectedClass) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real application, this would update the class in Firebase
      const updatedClass: ClassData = {
        ...selectedClass,
        name: className,
        type: classType,
        description: classDescription,
        instructor: classInstructor,
        schedule: {
          days: classDays,
          startTime: classStartTime,
          endTime: classEndTime
        },
        location: classLocation,
        capacity: parseInt(classCapacity),
        price: parseInt(classPrice),
        ageRange: classAgeRange,
        startDate: classStartDate,
        endDate: classEndDate || undefined
      };
      
      setClasses(classes.map(c => c.id === selectedClass.id ? updatedClass : c));
      setIsEditClassDialogOpen(false);
      
      toast({
        title: "Class Updated",
        description: "The class has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateClassForm = (): boolean => {
    if (!className) {
      toast({
        title: "Missing Information",
        description: "Please enter a class name.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classDescription) {
      toast({
        title: "Missing Information",
        description: "Please enter a class description.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classInstructor) {
      toast({
        title: "Missing Information",
        description: "Please select an instructor.",
        variant: "destructive",
      });
      return false;
    }
    
    if (classDays.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one day for the class.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classStartTime || !classEndTime) {
      toast({
        title: "Missing Information",
        description: "Please enter start and end times for the class.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter a location for the class.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classCapacity || parseInt(classCapacity) <= 0) {
      toast({
        title: "Invalid Capacity",
        description: "Please enter a valid capacity (greater than 0).",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classPrice || parseInt(classPrice) < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classAgeRange) {
      toast({
        title: "Missing Information",
        description: "Please enter an age range for the class.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!classStartDate) {
      toast({
        title: "Missing Information",
        description: "Please enter a start date for the class.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getClassTypeDisplay = (type: string) => {
    switch (type) {
      case "instrument":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Instrument</Badge>;
      case "vocal":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Vocal</Badge>;
      case "theory":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Theory</Badge>;
      case "ensemble":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Ensemble</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getClassStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case "instrument":
        return <FaGuitar className="text-blue-500" />;
      case "vocal":
        return <FaMicrophone className="text-purple-500" />;
      case "theory":
        return <FaChalkboardTeacher className="text-green-500" />;
      case "ensemble":
        return <FaUsers className="text-orange-500" />;
      default:
        return <FaMusic className="text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Class Management</h1>
          <p className="text-neutral-500">Create and manage music classes and workshops</p>
        </div>
        <Button onClick={handleOpenAddClassDialog}>
          <FaPlus className="mr-2" size={12} />
          Add New Class
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Classes and Workshops</CardTitle>
              <CardDescription>
                {filteredClasses.length} classes found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 w-full sm:w-[200px]"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <FaFilter className="mr-2" size={12} />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="instrument">Instrument</SelectItem>
                  <SelectItem value="vocal">Vocal</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="ensemble">Ensemble</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <FaFilter className="mr-2" size={12} />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.name}</TableCell>
                      <TableCell>{getClassTypeDisplay(classItem.type)}</TableCell>
                      <TableCell>{classItem.instructor}</TableCell>
                      <TableCell>
                        <span className="block">{classItem.schedule.days.join(", ")}</span>
                        <span className="text-sm text-neutral-500">
                          {classItem.schedule.startTime} - {classItem.schedule.endTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full max-w-[100px]">
                            <div className="bg-neutral-200 h-2 rounded-full">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(classItem.enrolledStudents / classItem.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-sm">
                            {classItem.enrolledStudents}/{classItem.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getClassStatusDisplay(classItem.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewStudents(classItem)}
                            className="h-8 w-8 p-0"
                          >
                            <FaUsers className="h-4 w-4" />
                            <span className="sr-only">View Students</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEditClassDialog(classItem)}
                            className="h-8 w-8 p-0"
                          >
                            <FaEdit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <FaTrash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-neutral-500">
                      No classes found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Class Dialog */}
      <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Create a new class or workshop by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Piano Fundamentals"
                />
              </div>
              <div>
                <Label htmlFor="class-type">Class Type</Label>
                <Select value={classType} onValueChange={setClassType}>
                  <SelectTrigger id="class-type">
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instrument">Instrument</SelectItem>
                    <SelectItem value="vocal">Vocal</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="ensemble">Ensemble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="class-description">Description</Label>
              <Textarea
                id="class-description"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                placeholder="Provide a detailed description of the class..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="class-instructor">Instructor</Label>
              <Select value={classInstructor} onValueChange={setClassInstructor}>
                <SelectTrigger id="class-instructor">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Miller">Sarah Miller</SelectItem>
                  <SelectItem value="Michael Johnson">Michael Johnson</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  <SelectItem value="Laura Wilson">Laura Wilson</SelectItem>
                  <SelectItem value="James Brown">James Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Class Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={classDays.includes(day) ? "default" : "outline"}
                    className={classDays.includes(day) ? "bg-primary hover:bg-primary-dark" : ""}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class-start-time">Start Time</Label>
                <Input
                  id="class-start-time"
                  type="time"
                  value={classStartTime}
                  onChange={(e) => setClassStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="class-end-time">End Time</Label>
                <Input
                  id="class-end-time"
                  type="time"
                  value={classEndTime}
                  onChange={(e) => setClassEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="class-location">Location</Label>
              <Input
                id="class-location"
                value={classLocation}
                onChange={(e) => setClassLocation(e.target.value)}
                placeholder="e.g. Room 101"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class-capacity">Capacity</Label>
                <Input
                  id="class-capacity"
                  type="number"
                  min="1"
                  value={classCapacity}
                  onChange={(e) => setClassCapacity(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label htmlFor="class-price">Monthly Price ($)</Label>
                <Input
                  id="class-price"
                  type="number"
                  min="0"
                  value={classPrice}
                  onChange={(e) => setClassPrice(e.target.value)}
                  placeholder="e.g. 120"
                />
              </div>
              <div>
                <Label htmlFor="class-age-range">Age Range</Label>
                <Input
                  id="class-age-range"
                  value={classAgeRange}
                  onChange={(e) => setClassAgeRange(e.target.value)}
                  placeholder="e.g. 7-12"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class-start-date">Start Date</Label>
                <Input
                  id="class-start-date"
                  type="date"
                  value={classStartDate}
                  onChange={(e) => setClassStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="class-end-date">End Date (Optional)</Label>
                <Input
                  id="class-end-date"
                  type="date"
                  value={classEndDate}
                  onChange={(e) => setClassEndDate(e.target.value)}
                />
                <p className="text-xs text-neutral-500 mt-1">Leave empty for ongoing classes</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddClassDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddClass}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Class...
                </div>
              ) : (
                "Create Class"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the details for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-class-name">Class Name</Label>
                <Input
                  id="edit-class-name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-class-type">Class Type</Label>
                <Select value={classType} onValueChange={setClassType}>
                  <SelectTrigger id="edit-class-type">
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instrument">Instrument</SelectItem>
                    <SelectItem value="vocal">Vocal</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="ensemble">Ensemble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-class-description">Description</Label>
              <Textarea
                id="edit-class-description"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-class-instructor">Instructor</Label>
              <Select value={classInstructor} onValueChange={setClassInstructor}>
                <SelectTrigger id="edit-class-instructor">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Miller">Sarah Miller</SelectItem>
                  <SelectItem value="Michael Johnson">Michael Johnson</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  <SelectItem value="Laura Wilson">Laura Wilson</SelectItem>
                  <SelectItem value="James Brown">James Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Class Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={classDays.includes(day) ? "default" : "outline"}
                    className={classDays.includes(day) ? "bg-primary hover:bg-primary-dark" : ""}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-class-start-time">Start Time</Label>
                <Input
                  id="edit-class-start-time"
                  type="time"
                  value={classStartTime}
                  onChange={(e) => setClassStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-class-end-time">End Time</Label>
                <Input
                  id="edit-class-end-time"
                  type="time"
                  value={classEndTime}
                  onChange={(e) => setClassEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-class-location">Location</Label>
              <Input
                id="edit-class-location"
                value={classLocation}
                onChange={(e) => setClassLocation(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-class-capacity">Capacity</Label>
                <Input
                  id="edit-class-capacity"
                  type="number"
                  min={selectedClass?.enrolledStudents || 1}
                  value={classCapacity}
                  onChange={(e) => setClassCapacity(e.target.value)}
                />
                {selectedClass && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Currently enrolled: {selectedClass.enrolledStudents}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-class-price">Monthly Price ($)</Label>
                <Input
                  id="edit-class-price"
                  type="number"
                  min="0"
                  value={classPrice}
                  onChange={(e) => setClassPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-class-age-range">Age Range</Label>
                <Input
                  id="edit-class-age-range"
                  value={classAgeRange}
                  onChange={(e) => setClassAgeRange(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-class-start-date">Start Date</Label>
                <Input
                  id="edit-class-start-date"
                  type="date"
                  value={classStartDate}
                  onChange={(e) => setClassStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-class-end-date">End Date (Optional)</Label>
                <Input
                  id="edit-class-end-date"
                  type="date"
                  value={classEndDate}
                  onChange={(e) => setClassEndDate(e.target.value)}
                />
                <p className="text-xs text-neutral-500 mt-1">Leave empty for ongoing classes</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditClassDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClass}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Class...
                </div>
              ) : (
                "Update Class"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Students Enrolled in {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              {selectedClass?.enrolledStudents} students enrolled out of {selectedClass?.capacity} capacity
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.length > 0 ? (
                      classStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.age}</TableCell>
                          <TableCell>{student.parent}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full max-w-[100px]">
                                <div className="bg-neutral-200 h-2 rounded-full">
                                  <div 
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${student.attendance}%` }}
                                  />
                                </div>
                              </div>
                              <span className="ml-2 text-sm">
                                {student.attendance}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {student.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                          No students enrolled in this class.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsViewStudentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManager;
