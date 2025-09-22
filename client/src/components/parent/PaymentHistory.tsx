import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FaFilePdf, FaCreditCard, FaFilter, FaDownload } from "react-icons/fa";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

type PaymentRow = {
  id: string;
  description: string;
  amount: number;     // PLN
  date: string;       // YYYY-MM-DD
  status: "paid" | "pending" | "overdue";
  studentName: string;
  currency?: string;  // PLN
  invoiceId?: string;
};

const base =
  typeof window !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:5001/perfect-tune/us-central1/api"
    : "https://us-central1-perfect-tune.cloudfunctions.net/api";

export default function PaymentHistory() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid || ""));
    return () => unsub();
  }, []);

  // pobieranie „moich” płatności
  useEffect(() => {
    if (!userId) {
      setPayments([]);
      return;
    }
    const q = query(
      collection(db, "payments"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows: PaymentRow[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          description: data.description || "Payment",
          amount: Number(data.amount || 0) / 100, // z groszy
          date: data.date || new Date().toISOString().split("T")[0],
          status: (data.status || "pending") as any,
          studentName: data.studentName || "Student",
          currency: data.currency || "PLN",
          invoiceId: data.invoiceId || undefined,
        };
      });
      setPayments(rows);
    });
    return () => unsub();
  }, [userId]);

  const filteredPayments = useMemo(() => {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate); oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const threeMonthsAgo = new Date(currentDate); threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    const sixMonthsAgo = new Date(currentDate); sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    return payments.filter(p => {
      if (timeFilter !== "all") {
        const dt = new Date(p.date);
        if (timeFilter === "1m" && dt < oneMonthAgo) return false;
        if (timeFilter === "3m" && dt < threeMonthsAgo) return false;
        if (timeFilter === "6m" && dt < sixMonthsAgo) return false;
      }
      if (statusFilter !== "all" && statusFilter !== p.status) return false;
      return true;
    });
  }, [payments, timeFilter, statusFilter]);

  const totals = useMemo(() => {
    const paid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const due  = payments.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
    const next = payments.find(p => p.status !== "paid")?.date || "No payments due";
    return { paid, due, next };
  }, [payments]);

  const getStatusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (status === "pending") return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    if (status === "overdue") return <Badge variant="destructive">Overdue</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  async function handlePayNow(payment: PaymentRow) {
    const u = auth.currentUser;
    if (!u) {
      toast({ title: "Zaloguj się", description: "Musisz być zalogowany, aby zapłacić.", variant: "destructive" });
      return;
    }
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`${base}/initiatePayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payment.amount,                 // w PLN (CF zamienia na grosze)
          description: payment.description,
          studentName: payment.studentName,
          parentName: u.displayName || u.email || "Rodzic",
          userId: u.uid,
          currency: payment.currency || "PLN",
          email: u.email || undefined,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const { gatewayUrl, form } = JSON.parse(text);
      if (!gatewayUrl || !form) throw new Error("Nieprawidłowa odpowiedź bramki.");

      // Auto-POST do Tpay (bez pustych pól)
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = gatewayUrl;
      formEl.style.display = "none";
      Object.entries(form).forEach(([k, v]) => {
        if (v == null || String(v).trim() === "") return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        formEl.appendChild(input);
      });
      if (!formEl.children.length) throw new Error("Brak parametrów do płatności.");
      document.body.appendChild(formEl);
      formEl.submit();
    } catch (err: any) {
      console.error("PayNow error:", err);
      toast({ title: "Payment Error", description: err?.message || "Problem przy inicjalizacji płatności.", variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
    }
  }

  async function handleDownloadInvoice(payment: PaymentRow) {
    try {
      if (!payment.invoiceId) {
        toast({ title: "Brak faktury", description: "Dla tej płatności nie ma jeszcze faktury (czy jest opłacona?)." });
        return;
      }
      // Stream PDF z CF:
      const url = `${base}/invoices/${payment.invoiceId}/pdf`;
      // Otwórz w nowej karcie (albo fetch i blob):
      window.open(url, "_blank");
    } catch (e: any) {
      console.error(e);
      toast({ title: "Błąd pobierania", description: String(e?.message || e), variant: "destructive" });
    }
  }

  const openReceipt = (p: PaymentRow) => {
    setSelectedPayment(p);
    setIsReceiptDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Payment History</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              View and manage your payments.
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                  filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell>{p.studentName}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.amount.toFixed(2)} {p.currency || "PLN"}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {p.status === "paid" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReceipt(p)}
                                className="h-8"
                              >
                                <FaFilePdf className="mr-1" size={12} />
                                Receipt
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(p)}
                                className="h-8"
                              >
                                <FaDownload size={12} />
                                <span className="sr-only">Download</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayNow(p)}
                              className="h-8"
                              disabled={isProcessingPayment}
                            >
                              <FaCreditCard className="mr-1" size={12} />
                              {isProcessingPayment ? "Processing..." : "Pay Now"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{totals.paid.toFixed(2)} PLN</p>
            </div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{totals.due.toFixed(2)} PLN</p>
            </div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Next Payment Due</p>
              <p className="text-2xl font-bold">{totals.next}</p>
            </div></CardContent></Card>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog (prostą fakturę pokazujemy wglądowo; PDF pobierzesz przyciskiem) */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt for {selectedPayment?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPayment ? (
              <div className="border rounded p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Payment ID</span>
                  <span className="font-medium">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Date</span>
                  <span className="font-medium">{selectedPayment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Amount</span>
                  <span className="font-bold">{selectedPayment.amount.toFixed(2)} {selectedPayment.currency || "PLN"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Status</span>
                  <span>{getStatusBadge(selectedPayment.status)}</span>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
            <Button
              onClick={() => selectedPayment && handleDownloadInvoice(selectedPayment)}
              disabled={!selectedPayment?.invoiceId}
            >
              <FaDownload className="mr-2" size={12} />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
