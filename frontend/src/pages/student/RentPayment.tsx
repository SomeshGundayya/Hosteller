import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  IndianRupee,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import API from "@/lib/api";
import type { Payment, Student } from "@/types";

const formatDate = (date?: string) => {
  if (!date) {
    return "-";
  }

  return format(new Date(date), "dd MMM yyyy");
};

const downloadTextFile = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export default function RentPayment() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPaymentData = async () => {
    if (!user?.email) {
      setPayments([]);
      setStudent(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const studentRes = await API.get(`/students/email/${user.email}`);
      const studentData = studentRes.data;

      setStudent(studentData);

      if (!studentData?._id) {
        setPayments([]);
        return;
      }

      const paymentsRes = await API.get(`/payments/student/${studentData._id}`);
      setPayments(paymentsRes.data.data || []);
    } catch (error) {
      console.error(error);
      setPayments([]);
      toast({
        title: "Unable to load payments",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, [user?.email]);

  const unpaidPayments = payments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue",
  );
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const pendingPayment = unpaidPayments[0];
  const totalDue = unpaidPayments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  );

  const now = new Date();
  const currentMonthPayment =
    payments.find(
      (payment) =>
        payment.month?.toLowerCase() === format(now, "MMMM").toLowerCase() &&
        payment.year === now.getFullYear(),
    ) || pendingPayment;

  const roomNumber = student?.room?.number || user?.roomNumber || "N/A";
  const monthlyRent =
    currentMonthPayment?.amount ||
    student?.room?.rent ||
    pendingPayment?.amount ||
    paidPayments[0]?.amount ||
    0;

  const handlePayment = async () => {
    if (!pendingPayment) {
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Select payment method",
        description: "Please choose a payment method before continuing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      await API.put(`/payments/${pendingPayment._id}/pay`);

      toast({
        title: "Payment successful",
        description: `Paid Rs. ${pendingPayment.amount.toLocaleString()} for ${pendingPayment.month} ${pendingPayment.year}.`,
      });

      setPaymentDialogOpen(false);
      setPaymentMethod("");
      await loadPaymentData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment failed",
        description: "We could not complete the payment right now.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadReceipt = (payment: Payment) => {
    const receipt = [
      "Hosteller Payment Receipt",
      `Student: ${student?.name || user?.name || "Student"}`,
      `Email: ${student?.email || user?.email || "-"}`,
      `Room: ${roomNumber}`,
      `Description: ${payment.description}`,
      `Billing Month: ${payment.month} ${payment.year}`,
      `Amount Paid: Rs. ${payment.amount.toLocaleString()}`,
      `Status: ${payment.status}`,
      `Paid On: ${formatDate(payment.paidAt)}`,
      `Due Date: ${formatDate(payment.dueDate)}`,
      `Generated On: ${format(new Date(), "dd MMM yyyy hh:mm a")}`,
    ].join("\n");

    downloadTextFile(
      receipt,
      `rent-receipt-${payment.month}-${payment.year}.txt`,
    );
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Rent Payment</h1>
        <p className="page-subtitle">View and pay your hostel rent</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>Total Due</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {totalDue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalDue > 0
                ? `${unpaidPayments.length} unpaid payment${unpaidPayments.length > 1 ? "s" : ""}`
                : "All dues cleared"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Month</CardDescription>
            <CardTitle className="text-xl">
              {format(now, "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMonthPayment ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {getStatusBadge(currentMonthPayment.status)}
                </p>
                <p className="text-muted-foreground">
                  Due: {formatDate(currentMonthPayment.dueDate)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment generated yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Room Number</CardDescription>
            <CardTitle className="text-xl">{roomNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monthly Rent: Rs. {monthlyRent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingPayment && (
        <Card className="mb-8 border-warning/30 bg-warning/5">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment Due
                </CardTitle>
                <CardDescription>
                  {pendingPayment.description} for {pendingPayment.month}{" "}
                  {pendingPayment.year} due by{" "}
                  {formatDate(pendingPayment.dueDate)}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  Rs. {pendingPayment.amount.toLocaleString()}
                </p>
                {getStatusBadge(pendingPayment.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Make Payment</DialogTitle>
                  <DialogDescription>
                    Pay Rs. {pendingPayment.amount.toLocaleString()} for{" "}
                    {pendingPayment.month} {pendingPayment.year}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      value={`Rs. ${pendingPayment.amount.toLocaleString()}`}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="netbanking">Net Banking</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentMethod === "upi" && (
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input placeholder="yourname@upi" />
                    </div>
                  )}
                  {paymentMethod === "card" && (
                    <>
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="***" type="password" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing
                      ? "Processing..."
                      : `Pay Rs. ${pendingPayment.amount.toLocaleString()}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {isLoading ? "Loading payments..." : "Your past rent payments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidPayments.length > 0 ? (
                paidPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>
                      {payment.description} ({payment.month} {payment.year})
                    </TableCell>
                    <TableCell className="font-medium">
                      Rs. {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReceipt(payment)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isLoading
                      ? "Loading payment history..."
                      : "No payment history yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
