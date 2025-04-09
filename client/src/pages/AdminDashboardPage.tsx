import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import ClassManager from "@/components/admin/ClassManager";
import UserManager from "@/components/admin/UserManager";
import CalendarView from "@/components/admin/CalendarView";
import { 
  FaTachometerAlt, 
  FaMusic, 
  FaCalendarAlt, 
  FaUsers, 
  FaCreditCard, 
  FaChartBar, 
  FaCog, 
  FaBell, 
  FaArrowUp,
  FaDollarSign,
  FaUserPlus,
  FaGraduationCap,
  FaCalendarPlus,
  FaExclamationTriangle
} from "react-icons/fa";

interface ClassDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface AgeDistribution {
  range: string;
  percentage: number;
}

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    monthlyRevenue: 0,
    pendingRegistrations: 0
  });
  const [classDistribution, setClassDistribution] = useState<ClassDistribution[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would fetch data from Firebase
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for the dashboard
        setStats({
          totalStudents: 142,
          activeClasses: 28,
          monthlyRevenue: 18245,
          pendingRegistrations: 12
        });
        
        setClassDistribution([
          { name: "Piano Classes", count: 48, percentage: 40 },
          { name: "Guitar Classes", count: 36, percentage: 30 },
          { name: "Vocal Classes", count: 24, percentage: 20 },
          { name: "Theory Classes", count: 18, percentage: 15 },
          { name: "Percussion & Drums", count: 16, percentage: 13 }
        ]);
        
        setAgeDistribution([
          { range: "5-7", percentage: 40 },
          { range: "8-10", percentage: 80 },
          { range: "11-13", percentage: 65 },
          { range: "14-17", percentage: 50 },
          { range: "18+", percentage: 30 }
        ]);
        
        setRecentActivity([
          {
            id: 1,
            type: "registration",
            icon: <FaUserPlus className="text-white" />,
            iconBg: "bg-primary-light",
            title: "New registration",
            description: "Amy Wilson registered her daughter for Piano Lessons",
            time: "10 minutes ago"
          },
          {
            id: 2,
            type: "payment",
            icon: <FaDollarSign className="text-green-600" />,
            iconBg: "bg-green-100",
            title: "Payment received",
            description: "John Smith paid $140 for Guitar Lessons",
            time: "45 minutes ago"
          },
          {
            id: 3,
            type: "class",
            icon: <FaCalendarPlus className="text-blue-600" />,
            iconBg: "bg-blue-100",
            title: "Class scheduled",
            description: "New Beginner Drum Class added to schedule",
            time: "2 hours ago"
          },
          {
            id: 4,
            type: "payment_due",
            icon: <FaExclamationTriangle className="text-yellow-600" />,
            iconBg: "bg-yellow-100",
            title: "Payment due reminder",
            description: "5 students have upcoming payments due",
            time: "3 hours ago"
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - MusicAcademy</title>
        <meta name="description" content="Admin dashboard for managing MusicAcademy classes, users, and system." />
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        {/* Admin Header */}
        <header className="bg-neutral-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="font-heading font-bold text-xl">MusicAcademy</span>
                <span className="ml-4 text-sm bg-primary px-2 py-1 rounded">Admin</span>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 relative">
                  <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white">
                    <FaBell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      5
                    </span>
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center font-bold">
                    A
                  </div>
                  <span className="ml-2 text-white font-medium hidden md:block">Admin</span>
                  <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white ml-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Admin Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-neutral-800 min-h-screen text-white">
            <div className="py-6 px-4">
              <Tabs
                defaultValue="dashboard"
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto space-y-1 bg-transparent">
                  <TabsTrigger
                    value="dashboard"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "dashboard" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaTachometerAlt className="mr-3" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="classes"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "classes" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaMusic className="mr-3" />
                    <span>Classes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "calendar" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaCalendarAlt className="mr-3" />
                    <span>Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "users" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaUsers className="mr-3" />
                    <span>Registered Users</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "payments" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaCreditCard className="mr-3" />
                    <span>Payments</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reports"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "reports" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaChartBar className="mr-3" />
                    <span>Reports</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                      activeTab === "settings" ? "bg-primary" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <FaCog className="mr-3" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-8">
            <TabsContent value="dashboard" className="mt-0">
              <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-neutral-600 text-sm">Total Students</p>
                        <h3 className="text-3xl font-bold mt-1">{stats.totalStudents}</h3>
                        <p className="text-green-600 text-sm mt-2">
                          <FaArrowUp className="inline mr-1" /> 12% from last month
                        </p>
                      </div>
                      <div className="bg-primary-light p-3 rounded-lg">
                        <FaGraduationCap className="text-white text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-neutral-600 text-sm">Active Classes</p>
                        <h3 className="text-3xl font-bold mt-1">{stats.activeClasses}</h3>
                        <p className="text-green-600 text-sm mt-2">
                          <FaArrowUp className="inline mr-1" /> 4% from last month
                        </p>
                      </div>
                      <div className="bg-secondary p-3 rounded-lg">
                        <FaMusic className="text-white text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-neutral-600 text-sm">Monthly Revenue</p>
                        <h3 className="text-3xl font-bold mt-1">${stats.monthlyRevenue.toLocaleString()}</h3>
                        <p className="text-green-600 text-sm mt-2">
                          <FaArrowUp className="inline mr-1" /> 8% from last month
                        </p>
                      </div>
                      <div className="bg-accent p-3 rounded-lg">
                        <FaDollarSign className="text-white text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-neutral-600 text-sm">Pending Registrations</p>
                        <h3 className="text-3xl font-bold mt-1">{stats.pendingRegistrations}</h3>
                        <p className="text-yellow-600 text-sm mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Requires attention
                        </p>
                      </div>
                      <div className="bg-neutral-700 p-3 rounded-lg">
                        <FaUserPlus className="text-white text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Calendar Overview */}
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Upcoming Classes</CardTitle>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </Button>
                      <span className="px-3 py-1 text-sm">July 2023</span>
                      <Button size="sm" variant="outline" className="h-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Monday</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tuesday</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wednesday</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thursday</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Friday</th>
                          <th className="px-4 py-2 border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Saturday</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border-b border-neutral-200 text-sm text-neutral-600">9:00 AM</td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              <p className="font-medium text-purple-800">Piano Advanced</p>
                              <p className="text-neutral-600">Room 101</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-neutral-200"></td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              <p className="font-medium text-blue-800">Violin Group</p>
                              <p className="text-neutral-600">Room 103</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-neutral-200"></td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              <p className="font-medium text-purple-800">Piano Advanced</p>
                              <p className="text-neutral-600">Room 101</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              <p className="font-medium text-green-800">Guitar Group</p>
                              <p className="text-neutral-600">Room 105</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border-b border-neutral-200 text-sm text-neutral-600">10:00 AM</td>
                          <td className="px-4 py-2 border-b border-neutral-200"></td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-green-100 p-2 rounded text-xs">
                              <p className="font-medium text-green-800">Guitar Group</p>
                              <p className="text-neutral-600">Room 105</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-neutral-200"></td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-red-100 p-2 rounded text-xs">
                              <p className="font-medium text-red-800">Voice Training</p>
                              <p className="text-neutral-600">Room 202</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-neutral-200"></td>
                          <td className="px-4 py-2 border-b border-neutral-200">
                            <div className="bg-yellow-100 p-2 rounded text-xs">
                              <p className="font-medium text-yellow-800">Music Theory</p>
                              <p className="text-neutral-600">Room 203</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button variant="ghost" className="text-primary hover:text-primary-dark inline-flex items-center">
                      View Full Calendar
                      <FaCalendarAlt className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity & User Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                              {activity.icon}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-neutral-600">{activity.description}</p>
                            <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm">
                        View All Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* User Overview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student Overview</CardTitle>
                    <select className="bg-neutral-100 border-0 rounded p-2 text-sm">
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>This Quarter</option>
                      <option>This Year</option>
                    </select>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classDistribution.map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm font-medium">{item.count} students</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 border-t border-neutral-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Age Distribution</h3>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {ageDistribution.map((item) => (
                          <div key={item.range}>
                            <div className="h-24 flex items-end">
                              <div
                                className="w-full bg-primary-light rounded-t"
                                style={{ height: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">{item.range}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="classes" className="mt-0">
              <ClassManager />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <CalendarView />
            </TabsContent>
            
            <TabsContent value="users" className="mt-0">
              <UserManager />
            </TabsContent>
            
            <TabsContent value="payments" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>
                    View and manage all payments in the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    This section will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Reports and Analytics</CardTitle>
                  <CardDescription>
                    View detailed reports and statistics about your business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    This section will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    This section will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
