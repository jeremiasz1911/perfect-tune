import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FaFilePdf, FaFileInvoice, FaCreditCard, FaFilter, FaDownload } from "react-icons/fa";

interface PaymentData {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  studentName: string;
  currency?: string;
  itemId?: string;
  itemType?: 'class' | 'workshop' | 'materials';
}

interface PaymentHistoryProps {
  payments: PaymentData[];
}

const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  
  const { toast } = useToast();

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

  const filteredPayments = payments.filter(payment => {
    // Filter by time
    if (timeFilter !== "all") {
      const paymentDate = new Date(payment.date);
      if (timeFilter === "1m" && paymentDate < oneMonthAgo) return false;
      if (timeFilter === "3m" && paymentDate < threeMonthsAgo) return false;
      if (timeFilter === "6m" && paymentDate < sixMonthsAgo) return false;
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "paid" && !payment.status.toLowerCase().includes("paid")) return false;
      if (statusFilter === "due" && !payment.status.toLowerCase().includes("due")) return false;
    }
    
    return true;
  });

  const getTotalPaid = () => {
    return payments
      .filter(p => p.status.toLowerCase().includes("paid"))
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getTotalDue = () => {
    return payments
      .filter(p => p.status.toLowerCase().includes("due"))
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const handleMakePayment = (payment: PaymentData) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const handleViewReceipt = (payment: PaymentData) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  const handleDownloadInvoice = (paymentId: string) => {
    toast({
      title: "Download Started",
      description: "Your invoice is being downloaded.",
    });
  };

  const processPayment = async () => {
    if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // In a real application, this would integrate with Tpay
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      
      setIsPaymentDialogOpen(false);
      // In a real application, you would refresh the payments list here
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvc("");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes("paid")) {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    } else if (status.toLowerCase().includes("due")) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Payment History</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              View and manage your payment history and upcoming payments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[130px]">
                <FaFilter className="mr-2" size={12} />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <FaFilter className="mr-2" size={12} />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="due">Due</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.description}</TableCell>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.amount.toFixed(2)} {payment.currency || 'PLN'}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status.toLowerCase().includes("paid") ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewReceipt(payment)}
                              className="h-8"
                            >
                              <FaFilePdf className="mr-1" size={12} />
                              Receipt
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMakePayment(payment)}
                              className="h-8"
                            >
                              <FaCreditCard className="mr-1" size={12} />
                              Pay Now
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment.id)}
                            className="h-8"
                          >
                            <FaDownload size={12} />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                      No payments found matching your filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">{getTotalPaid().toFixed(2)} PLN</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-1">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">{getTotalDue().toFixed(2)} PLN</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-1">Next Payment Due</p>
                  <p className="text-2xl font-bold">
                    {payments.find(p => p.status.toLowerCase().includes("due"))?.date || "No payments due"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white mr-4">
                <i className="fas fa-credit-card"></i>
              </div>
              <div>
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-neutral-500">**** **** **** 4567</p>
              </div>
            </div>
            <Badge>Default</Badge>
          </div>
          <div className="mt-4">
            <Button variant="outline">
              <FaCreditCard className="mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for {selectedPayment?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-neutral-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span>{selectedPayment?.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Student:</span>
                <span>{selectedPayment?.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-bold">{selectedPayment?.amount.toFixed(2)} {selectedPayment?.currency || 'PLN'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-expiry">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input
                    id="card-cvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Pay $${selectedPayment?.amount.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt for {selectedPayment?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="border-t border-b py-6 my-4">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">MusicAcademy</h3>
                  <p className="text-sm text-neutral-500">123 Music Street, Suite 101</p>
                  <p className="text-sm text-neutral-500">Harmony City, CA 90210</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold">Receipt</h4>
                  <p className="text-sm text-neutral-500">ID: {selectedPayment?.id}</p>
                  <p className="text-sm text-neutral-500">Date: {selectedPayment?.date}</p>
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Description</span>
                  <span className="font-medium">Amount</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedPayment?.description}</span>
                  <span>${selectedPayment?.amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 font-bold">
                <span>Total Paid</span>
                <span>${selectedPayment?.amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-4">Thank you for your payment!</p>
              <p className="text-xs text-neutral-400">This is a computer-generated receipt and does not require a signature.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReceiptDialogOpen(false)}
            >
              Close
            </Button>
            <Button>
              <FaDownload className="mr-2" size={12} />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentHistory;
