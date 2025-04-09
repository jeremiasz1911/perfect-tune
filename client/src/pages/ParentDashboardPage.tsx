import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getUserByUid, getChildrenByParentId, getEnrollmentsByChildId, getPaymentsByUserId } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import ChildrenManager from "@/components/parent/ChildrenManager";
import ClassRegistration from "@/components/parent/ClassRegistration";
import PaymentHistory from "@/components/parent/PaymentHistory";
import { FaHome, FaMusic, FaCreditCard, FaCog, FaCalendarAlt, FaChild, FaBell } from "react-icons/fa";

interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string;
}

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

interface PaymentData {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  studentName: string;
}

const ParentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user data
        const userDataResult = await getUserByUid(user.uid);
        if (userDataResult) {
          setUserData({
            id: userDataResult.id,
            name: userDataResult.name,
            surname: userDataResult.surname,
            email: userDataResult.email
          });
        }
        
        // Fetch children data
        const childrenResult = await getChildrenByParentId(user.uid);
        if (childrenResult) {
          setChildren(childrenResult);
          
          // For demo purposes, set mock class data (in a real app, this would come from Firebase)
          const mockClasses = [
            {
              id: "class1",
              childId: childrenResult[0]?.id || "child1",
              childName: childrenResult[0]?.name || "Emma",
              className: "Piano Fundamentals",
              schedule: "Tuesdays, 4:00 PM - 5:00 PM",
              location: "Room 101",
              status: "Active",
              nextClass: "Tomorrow at 4:00 PM",
              attendance: 92
            },
            {
              id: "class2",
              childId: childrenResult[0]?.id || "child1",
              childName: childrenResult[0]?.name || "Emma",
              className: "Music Theory for Kids",
              schedule: "Thursdays, 5:00 PM - 6:00 PM",
              location: "Room 203",
              status: "Active",
              nextClass: "Today at 5:00 PM",
              attendance: 88
            },
            {
              id: "class3",
              childId: childrenResult[1]?.id || "child2",
              childName: childrenResult[1]?.name || "Jack",
              className: "Guitar for Beginners",
              schedule: "Mondays, 5:00 PM - 6:00 PM",
              location: "Room 105",
              status: "Active",
              nextClass: "Monday at 5:00 PM",
              attendance: 85
            },
            {
              id: "class4",
              childId: childrenResult[1]?.id || "child2",
              childName: childrenResult[1]?.name || "Jack",
              className: "Rock Band Workshop",
              schedule: "Fridays, 4:00 PM - 6:00 PM",
              location: "Room 108",
              status: "Starting Soon",
              nextClass: "July 15 at 4:00 PM",
              attendance: 0
            }
          ];
          setClasses(mockClasses);
        }
        
        // For demo purposes, set mock payment data (in a real app, this would come from Firebase)
        const mockPayments = [
          {
            id: "payment1",
            description: "Piano Fundamentals - July",
            amount: 120,
            date: "July 1, 2023",
            status: "Paid",
            studentName: childrenResult[0]?.name || "Emma"
          },
          {
            id: "payment2",
            description: "Music Theory - July",
            amount: 90,
            date: "July 1, 2023",
            status: "Paid",
            studentName: childrenResult[0]?.name || "Emma"
          },
          {
            id: "payment3",
            description: "Guitar for Beginners - July",
            amount: 130,
            date: "July 1, 2023",
            status: "Paid",
            studentName: childrenResult[1]?.name || "Jack"
          },
          {
            id: "payment4",
            description: "Rock Band Workshop",
            amount: 200,
            date: "July 1, 2023",
            status: "Due July 10",
            studentName: childrenResult[1]?.name || "Jack"
          }
        ];
        setPayments(mockPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcomingClasses = classes
    .filter(c => c.status === "Active" || c.status === "Starting Soon")
    .sort((a, b) => {
      const dateA = new Date(a.nextClass);
      const dateB = new Date(b.nextClass);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const outstandingPayment = payments.find(p => p.status.startsWith("Due"));
  const outstandingAmount = outstandingPayment ? outstandingPayment.amount : 0;

  return (
    <>
      <Helmet>
        <title>Parent Dashboard - MusicAcademy</title>
        <meta name="description" content="Manage your children's music education, classes, and payments." />
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        {/* Dashboard Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="font-heading font-bold text-xl text-neutral-800">Parent Dashboard</span>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 relative">
                  <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary">
                    <FaBell className="h-5 w-5" />
                    {outstandingPayment && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        1
                      </span>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
                    {userData?.name.charAt(0)}
                  </div>
                  <span className="ml-2 text-neutral-700 font-medium hidden md:block">
                    {userData?.name} {userData?.surname}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 mb-8 md:mb-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col h-auto space-y-1 bg-transparent">
                    <TabsTrigger value="overview" className="flex items-center justify-start px-4 py-2 text-left">
                      <FaHome className="mr-3" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="classes" className="flex items-center justify-start px-4 py-2 text-left">
                      <FaMusic className="mr-3" />
                      <span>Classes</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center justify-start px-4 py-2 text-left">
                      <FaCreditCard className="mr-3" />
                      <span>Payments</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center justify-start px-4 py-2 text-left">
                      <FaCog className="mr-3" />
                      <span>Account Settings</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-2">Children</h3>
                  <ul className="space-y-1">
                    {children.map(child => (
                      <li key={child.id}>
                        <Button variant="ghost" className="flex items-center justify-start px-4 py-2 w-full">
                          <div className="w-6 h-6 bg-primary-light text-white rounded-full flex items-center justify-center mr-3 text-xs">
                            {child.name.charAt(0)}
                          </div>
                          <span>{child.name} {child.surname}</span>
                        </Button>
                      </li>
                    ))}
                    <li>
                      <Button variant="ghost" className="flex items-center justify-start px-4 py-2 text-primary hover:text-primary-dark w-full">
                        <FaChild className="mr-3" />
                        <span>Add Child</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 md:ml-8">
              <TabsContent value="overview" className="mt-0">
                {/* Welcome Message */}
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-2xl font-bold mb-2">Welcome back, {userData?.name}!</h2>
                        <p className="text-neutral-600">
                          Here's an overview of your children's music education progress.
                        </p>
                      </div>
                      <Button className="bg-primary hover:bg-primary-dark text-white">
                        View Upcoming Classes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Children Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {children.map(child => {
                    const childClasses = classes.filter(c => c.childId === child.id);
                    const activeClasses = childClasses.filter(c => c.status === "Active");
                    const nextClass = activeClasses.length > 0
                      ? activeClasses.sort((a, b) => new Date(a.nextClass).getTime() - new Date(b.nextClass).getTime())[0]
                      : null;
                    const avgAttendance = activeClasses.length > 0
                      ? activeClasses.reduce((sum, c) => sum + c.attendance, 0) / activeClasses.length
                      : 0;
                    
                    return (
                      <Card key={child.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-4 text-lg">
                                  {child.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{child.name} {child.surname}</h3>
                                  <p className="text-neutral-600 text-sm">Age: {child.age}</p>
                                </div>
                              </div>
                              <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm">
                                View Details
                              </Button>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Current Classes</h4>
                              {activeClasses.length > 0 ? (
                                activeClasses.map(c => (
                                  <div key={c.id} className="bg-neutral-50 p-3 rounded-md mb-2 last:mb-0">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{c.className}</p>
                                        <p className="text-sm text-neutral-600">{c.schedule}</p>
                                      </div>
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {c.status}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-neutral-50 p-3 rounded-md">
                                  <p className="text-neutral-600 text-center">No active classes</p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Attendance</h4>
                              <div className="flex items-center">
                                <div className="w-full bg-neutral-200 rounded-full h-4">
                                  <div
                                    className="bg-primary h-4 rounded-full"
                                    style={{ width: `${avgAttendance}%` }}
                                  ></div>
                                </div>
                                <span className="ml-3 text-sm font-medium">{avgAttendance.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-neutral-600">
                                {nextClass ? (
                                  <>
                                    <span className="font-medium text-neutral-800">Next class:</span> {nextClass.nextClass}
                                  </>
                                ) : (
                                  <span>No upcoming classes</span>
                                )}
                              </div>
                              <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm">
                                Register for Classes
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Upcoming Schedule */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Upcoming Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingClasses.length > 0 ? (
                        upcomingClasses.map((classItem, index) => {
                          let borderClass = "border-neutral-300";
                          if (index === 0) borderClass = "border-primary";
                          
                          return (
                            <div key={classItem.id} className={`border-l-4 ${borderClass} pl-4`}>
                              <h4 className="font-medium mb-2">
                                {index === 0 ? "Today" : index === 1 ? "Tomorrow" : classItem.nextClass.split(" at ")[0]}
                              </h4>
                              <div className="bg-neutral-50 p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium">{classItem.className}</span>
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {classItem.childName}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-600">
                                      {classItem.nextClass.split(" at ")[1]} • {classItem.location}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon">
                                    <span className="sr-only">Actions</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="h-5 w-5"
                                    >
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-neutral-600">No upcoming classes scheduled</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="ghost" className="text-primary hover:text-primary-dark inline-flex items-center">
                        View Full Calendar
                        <FaCalendarAlt className="ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment Summary</CardTitle>
                    <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm">
                      View All Payments
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {payments.map(payment => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-800">{payment.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-neutral-600">{payment.studentName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-neutral-600">{payment.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-800">${payment.amount.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {outstandingPayment && (
                      <div className="mt-6 flex justify-between items-center border-t border-neutral-100 pt-4">
                        <div>
                          <p className="text-neutral-600">
                            Outstanding balance: <span className="font-bold text-neutral-800">${outstandingAmount.toFixed(2)}</span>
                          </p>
                        </div>
                        <Button className="bg-primary hover:bg-primary-dark text-white">
                          Pay Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="classes" className="mt-0">
                <ClassRegistration children={children} classes={classes} />
              </TabsContent>
              
              <TabsContent value="payments" className="mt-0">
                <PaymentHistory payments={payments} />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account details and children</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <ChildrenManager children={children} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParentDashboardPage;
