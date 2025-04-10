import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

interface Payment {
  id: string;
  studentName: string;
  parentName: string;
  amount: number;
  date: string;
  type: 'class' | 'workshop' | 'materials';
  status: 'paid' | 'pending' | 'overdue';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  description: string;
}

const PaymentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Example payments data
  const payments: Payment[] = [
    {
      id: 'p1',
      studentName: 'Emily Johnson',
      parentName: 'Sarah Johnson',
      amount: 150,
      date: '2025-03-15',
      type: 'class',
      status: 'paid',
      method: 'credit_card',
      description: 'Piano Lessons - March'
    },
    {
      id: 'p2',
      studentName: 'Max Wilson',
      parentName: 'Robert Wilson',
      amount: 85,
      date: '2025-03-20',
      type: 'workshop',
      status: 'paid',
      method: 'bank_transfer',
      description: 'Jazz Improvisation Workshop'
    },
    {
      id: 'p3',
      studentName: 'Sophie Davis',
      parentName: 'James Davis',
      amount: 180,
      date: '2025-04-01',
      type: 'class',
      status: 'pending',
      method: 'credit_card',
      description: 'Guitar Lessons - April'
    },
    {
      id: 'p4',
      studentName: 'Oliver Brown',
      parentName: 'Michael Brown',
      amount: 35,
      date: '2025-03-10',
      type: 'materials',
      status: 'overdue',
      method: 'cash',
      description: 'Sheet Music and Books'
    },
    {
      id: 'p5',
      studentName: 'Emma Miller',
      parentName: 'David Miller',
      amount: 155,
      date: '2025-04-05',
      type: 'class',
      status: 'pending',
      method: 'bank_transfer',
      description: 'Vocal Training - April'
    }
  ];

  // Filter payments based on search query and status filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="show"
      variants={fadeIn("up", 0.5)}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
        <p className="text-gray-600">View and manage payments from students and parents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Paid</CardTitle>
            <CardDescription>Completed payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
            <CardDescription>Upcoming payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overdue</CardTitle>
            <CardDescription>Late payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search by student name or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="whitespace-nowrap">
            + New Payment
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 border-b">Student</th>
                <th className="text-left px-4 py-3 border-b">Parent</th>
                <th className="text-left px-4 py-3 border-b">Description</th>
                <th className="text-left px-4 py-3 border-b">Date</th>
                <th className="text-left px-4 py-3 border-b">Amount</th>
                <th className="text-left px-4 py-3 border-b">Status</th>
                <th className="text-left px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 border-b">{payment.studentName}</td>
                    <td className="px-4 py-4 border-b">{payment.parentName}</td>
                    <td className="px-4 py-4 border-b">{payment.description}</td>
                    <td className="px-4 py-4 border-b">{payment.date}</td>
                    <td className="px-4 py-4 border-b font-medium">${payment.amount}</td>
                    <td className="px-4 py-4 border-b">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 border-b">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No payments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentManagement;