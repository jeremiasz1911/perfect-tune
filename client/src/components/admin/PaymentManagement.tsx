import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { toast } from '@/hooks/use-toast';
import { FaEllipsisV, FaFileInvoice, FaSearch, FaFilter } from 'react-icons/fa';
import { useEffect } from 'react';
import { paymentsCollection } from '@/lib/db';
import { getDocs } from 'firebase/firestore';

interface Payment {
  id: string;
  studentName: string;
  parentName: string;
  amount: number;
  date: string;
  type: 'class' | 'workshop' | 'materials';
  status: 'paid' | 'pending' | 'overdue';
  method: 'Tpay' | 'bank_transfer' | 'cash' | 'other';
  currency: string;
  description: string;
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      studentName: 'Emma Johnson',
      parentName: 'Sarah Johnson',
      amount: 120.00,
      date: '2025-04-05',
      type: 'class',
      status: 'paid',
      method: 'Tpay',
      currency: 'PLN',
      description: 'Piano Lessons - April 2025'
    },
    {
      id: 'PAY-002',
      studentName: 'Noah Smith',
      parentName: 'Michael Smith',
      amount: 150.00,
      date: '2025-04-07',
      type: 'class',
      status: 'paid',
      method: 'bank_transfer',
      currency: 'PLN',
      description: 'Guitar Lessons - April 2025'
    },
    {
      id: 'PAY-003',
      studentName: 'Olivia Brown',
      parentName: 'Jessica Brown',
      amount: 80.00,
      date: '2025-04-08',
      type: 'workshop',
      status: 'paid',
      method: 'Tpay',
      currency: 'PLN',
      description: 'Summer Music Workshop'
    },
    {
      id: 'PAY-004',
      studentName: 'Liam Davis',
      parentName: 'Jennifer Davis',
      amount: 45.00,
      date: '2025-04-10',
      type: 'materials',
      status: 'pending',
      method: 'other',
      currency: 'PLN',
      description: 'Music Books and Sheet Music'
    },
    {
      id: 'PAY-005',
      studentName: 'Ava Wilson',
      parentName: 'Robert Wilson',
      amount: 120.00,
      date: '2025-03-15',
      type: 'class',
      status: 'overdue',
      method: 'bank_transfer',
      currency: 'PLN',
      description: 'Violin Lessons - March 2025'
    },
    {
      id: 'PAY-006',
      studentName: 'Mason Thompson',
      parentName: 'David Thompson',
      amount: 135.00,
      date: '2025-04-12',
      type: 'class',
      status: 'pending',
      method: 'cash',
      currency: 'PLN',
      description: 'Drum Lessons - April 2025'
    },
    {
      id: 'PAY-007',
      studentName: 'Sofia Martinez',
      parentName: 'Maria Martinez',
      amount: 90.00,
      date: '2025-04-09',
      type: 'workshop',
      status: 'paid',
      method: 'Tpay',
      currency: 'PLN',
      description: 'Songwriting Workshop'
    }
  ]);
  
  // Load payments from Firestore
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const querySnapshot = await getDocs(paymentsCollection);
        const paymentData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            studentName: data.studentName || 'Unknown Student',
            parentName: data.parentName || 'Unknown Parent',
            amount: data.amount / 100, // Convert from cents to PLN
            date: data.date || data.paymentDate?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            type: data.type || 'class',
            status: data.status || 'pending',
            method: data.method || data.paymentMethod || 'Tpay',
            currency: data.currency || 'PLN', 
            description: data.description || 'Payment'
          } as Payment;
        });
        
        if (paymentData.length > 0) {
          setPayments(paymentData);
          console.log("Loaded payments from Firestore:", paymentData);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };
    
    fetchPayments();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showSendReminder, setShowSendReminder] = useState(false);
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleSendReminder = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowSendReminder(true);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'paid' } 
        : payment
    ));
    
    toast({
      title: "Payment Updated",
      description: "Payment has been marked as paid successfully.",
    });
  };

  const sendPaymentReminder = () => {
    if (selectedPayment) {
      toast({
        title: "Reminder Sent",
        description: `Payment reminder sent to parent of ${selectedPayment.studentName}.`,
      });
      setShowSendReminder(false);
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return null;
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
        <p className="text-gray-600">View and manage all payments in the system</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>Quick summary of payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-green-700 font-semibold">Paid</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-3xl font-bold text-green-700">
                  {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toFixed(2)} PLN
                </span>
                <span className="text-green-600">
                  {payments.filter(p => p.status === 'paid').length} payments
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-yellow-700 font-semibold">Pending</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-3xl font-bold text-yellow-700">
                  {payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toFixed(2)} PLN
                </span>
                <span className="text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length} payments
                </span>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-red-700 font-semibold">Overdue</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-3xl font-bold text-red-700">
                  ${payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </span>
                <span className="text-red-600">
                  {payments.filter(p => p.status === 'overdue').length} payments
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage all payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search payments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-500" />
              <span className="text-sm mr-2">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-24 sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center ml-0 sm:ml-4">
              <span className="text-sm mr-2">Type:</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-24 sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Parent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell className="hidden md:table-cell">{payment.parentName}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="hidden md:table-cell capitalize">{payment.type}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FaEllipsisV className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <FaFileInvoice className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {payment.status !== 'paid' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(payment.id)}>
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendReminder(payment)}>
                                  Send Reminder
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No payments found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about this payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Payment ID</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-gray-500 text-sm">Status</Label>
                  <p>{getStatusBadge(selectedPayment.status)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-gray-500 text-sm">Description</Label>
                <p className="font-medium">{selectedPayment.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Student</Label>
                  <p className="font-medium">{selectedPayment.studentName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Parent</Label>
                  <p className="font-medium">{selectedPayment.parentName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Amount</Label>
                  <p className="font-bold text-lg">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Date</Label>
                  <p className="font-medium">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Payment Type</Label>
                  <p className="font-medium capitalize">{selectedPayment.type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500 text-sm">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedPayment.method.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            {selectedPayment && selectedPayment.status !== 'paid' && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  handleMarkAsPaid(selectedPayment.id);
                  setShowPaymentDetails(false);
                }}
              >
                Mark as Paid
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPaymentDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showSendReminder} onOpenChange={setShowSendReminder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder to the parent about an upcoming or overdue payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="recipient">Recipient</Label>
                <Input id="recipient" value={`${selectedPayment.parentName} (Parent of ${selectedPayment.studentName})`} readOnly />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={`Payment Reminder: ${selectedPayment.description}`} />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={`Dear ${selectedPayment.parentName},\n\nThis is a friendly reminder about the payment (${selectedPayment.id}) for ${selectedPayment.description} in the amount of $${selectedPayment.amount.toFixed(2)}.\n\nPlease process this payment at your earliest convenience.\n\nThank you,\nMusicAcademy Team`}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowSendReminder(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={sendPaymentReminder}>
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PaymentManagement;