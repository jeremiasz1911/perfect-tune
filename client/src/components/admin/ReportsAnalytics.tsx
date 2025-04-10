import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

// Sample data for the reports
const revenueData = [
  { month: 'Jan', amount: 4000 },
  { month: 'Feb', amount: 4500 },
  { month: 'Mar', amount: 5100 },
  { month: 'Apr', amount: 4800 },
  { month: 'May', amount: 5300 },
  { month: 'Jun', amount: 6000 },
  { month: 'Jul', amount: 5500 },
  { month: 'Aug', amount: 5800 },
  { month: 'Sep', amount: 6200 },
  { month: 'Oct', amount: 6500 },
  { month: 'Nov', amount: 7000 },
  { month: 'Dec', amount: 7200 },
];

const enrollmentData = [
  { month: 'Jan', students: 25 },
  { month: 'Feb', students: 28 },
  { month: 'Mar', students: 32 },
  { month: 'Apr', students: 35 },
  { month: 'May', students: 40 },
  { month: 'Jun', students: 45 },
  { month: 'Jul', students: 42 },
  { month: 'Aug', students: 48 },
  { month: 'Sep', students: 52 },
  { month: 'Oct', students: 55 },
  { month: 'Nov', students: 58 },
  { month: 'Dec', students: 60 },
];

const classDistributionData = [
  { name: 'Piano', value: 35, color: '#8884d8' },
  { name: 'Guitar', value: 25, color: '#82ca9d' },
  { name: 'Vocal', value: 20, color: '#ffc658' },
  { name: 'Drums', value: 10, color: '#ff8042' },
  { name: 'Violin', value: 15, color: '#0088fe' },
];

const ageDistributionData = [
  { name: '3-6', students: 15 },
  { name: '7-10', students: 25 },
  { name: '11-14', students: 20 },
  { name: '15-18', students: 18 },
  { name: 'Adults', students: 22 },
];

const ReportsAnalytics = () => {
  const [timeRange, setTimeRange] = useState('year');

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="show"
      variants={fadeIn("up", 0.5)}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Insights and statistics about your music school</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Students</CardTitle>
            <CardDescription>Currently enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">60</p>
            <p className="text-sm text-green-600">+5 since last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
            <CardDescription>Current year</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">$68,400</p>
            <p className="text-sm text-green-600">+12% year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Class Size</CardTitle>
            <CardDescription>Students per class</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">8.5</p>
            <p className="text-sm text-yellow-600">+0.3 since last quarter</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Retention Rate</CardTitle>
            <CardDescription>Student retention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">92%</p>
            <p className="text-sm text-green-600">+2% since last year</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="revenue">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="revenue" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Revenue Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="enrollment" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Enrollment Trends</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={enrollmentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="classes" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Class Distribution</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} students`, 'Enrollment']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="demographics" className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Age Distribution</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageDistributionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Popular Class Times</CardTitle>
            <CardDescription>Most preferred days and times</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>Monday, 3:00 PM - 5:00 PM</span>
                <span className="text-primary font-medium">32 students</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Wednesday, 4:00 PM - 6:00 PM</span>
                <span className="text-primary font-medium">28 students</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Tuesday, 3:30 PM - 5:30 PM</span>
                <span className="text-primary font-medium">25 students</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Saturday, 10:00 AM - 12:00 PM</span>
                <span className="text-primary font-medium">22 students</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Thursday, 4:30 PM - 6:30 PM</span>
                <span className="text-primary font-medium">18 students</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Instructor Performance</CardTitle>
            <CardDescription>Based on student feedback and retention</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>Sarah Johnson (Piano)</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">4.9/5</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span>David Miller (Guitar)</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">4.7/5</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span>Emily Wilson (Vocal)</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">4.8/5</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span>Michael Brown (Drums)</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">4.5/5</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span>Robert Davis (Theory)</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">4.6/5</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ReportsAnalytics;