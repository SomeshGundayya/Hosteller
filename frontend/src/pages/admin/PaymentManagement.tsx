import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import API from "@/lib/api";
import type { Payment, Student } from "@/types";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();

const defaultFormState = {
  student: "",
  amount: "",
  month: format(new Date(), "MMMM"),
  year: String(currentYear),
  dueDate: format(new Date(), "yyyy-MM-dd"),
  description: "Hostel Rent",
  status: "pending",
};

const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

const formatPaymentDate = (payment: Payment) => {
  const value = payment.paidAt || payment.dueDate;
  return value ? format(new Date(value), "dd MMM yyyy") : "-";
};

const createMonthKey = (payment: Payment) =>
  `${payment.month}-${payment.year}`.toLowerCase();

const getStudentName = (payment: Payment) =>
  payment.student?.name || "Student record missing";

const getRoomLabel = (payment: Payment) =>
  payment.student?.room?.number || "Room not assigned";

const downloadTextFile = (content: string, fileName: string, type = "text/plain") => {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
};

export default function PaymentManagement() {
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const selectedStudent = students.find((student) => student._id === formData.student);

  const loadData = async () => {
    try {
      const [paymentRes, studentRes] = await Promise.all([
        API.get("/payments"),
        API.get("/students"),
      ]);

      setPayments(paymentRes.data.data || []);
      setStudents(studentRes.data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load payment data",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedStudent?.room?.rent) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      amount: prev.amount ? prev.amount : String(selectedStudent.room?.rent || ""),
    }));
  }, [selectedStudent?._id, selectedStudent?.room?.rent]);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Map<string, { value: string; label: string; sortValue: number }>();

    payments.forEach((payment) => {
      const monthIndex = monthNames.findIndex(
        (month) => month.toLowerCase() === payment.month?.toLowerCase()
      );

      const resolvedMonthIndex = monthIndex >= 0 ? monthIndex : 0;
      const value = createMonthKey(payment);
      const label = `${payment.month} ${payment.year}`;
      const sortValue = payment.year * 100 + resolvedMonthIndex;

      uniqueMonths.set(value, {
        value,
        label,
        sortValue,
      });
    });

    return Array.from(uniqueMonths.values()).sort((a, b) => b.sortValue - a.sortValue);
  }, [payments]);

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name)),
    [students]
  );

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const studentName = getStudentName(payment).toLowerCase();
      const roomNumber = getRoomLabel(payment).toLowerCase();
      const description = payment.description?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        roomNumber.includes(query) ||
        description.includes(query);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      const matchesMonth =
        monthFilter === "all" || createMonthKey(payment) === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payments, searchQuery, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const totalCollected = filteredPayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingAmount = filteredPayments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const overdueAmount = filteredPayments
      .filter((payment) => payment.status === "overdue")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const paidCount = filteredPayments.filter((payment) => payment.status === "paid").length;
    const pendingCount = filteredPayments.filter((payment) => payment.status === "pending").length;
    const overdueCount = filteredPayments.filter((payment) => payment.status === "overdue").length;
    const total = paidCount + pendingCount + overdueCount;

    return {
      totalCollected,
      pendingAmount,
      overdueAmount,
      paidCount,
      pendingCount,
      overdueCount,
      collectionRate: total ? Math.round((paidCount / total) * 100) : 0,
      totalRecords: total,
    };
  }, [filteredPayments]);

  const activeMonthLabel =
    monthFilter === "all"
      ? "All months"
      : monthOptions.find((option) => option.value === monthFilter)?.label || "Selected month";

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

  const exportPayments = (rows: Payment[]) => {
    const headers = [
      "Student",
      "Room",
      "Description",
      "Month",
      "Year",
      "Amount",
      "Status",
      "Due Date",
      "Paid At",
    ];

    const csvRows = rows.map((payment) =>
      [
        getStudentName(payment),
        getRoomLabel(payment),
        payment.description || "",
        payment.month || "",
        payment.year || "",
        payment.amount || 0,
        payment.status,
        payment.dueDate ? format(new Date(payment.dueDate), "yyyy-MM-dd") : "",
        payment.paidAt ? format(new Date(payment.paidAt), "yyyy-MM-dd") : "",
      ]
        .map(escapeCsvValue)
        .join(",")
    );

    downloadTextFile(
      [headers.map(escapeCsvValue).join(","), ...csvRows].join("\n"),
      `payments-${monthFilter === "all" ? "all" : monthFilter}.csv`,
      "text/csv"
    );
  };

  const generateReport = () => {
    const reportLines = [
      "Hosteller Payment Report",
      `Generated On: ${format(new Date(), "dd MMM yyyy hh:mm a")}`,
      `Scope: ${activeMonthLabel}`,
      `Status Filter: ${statusFilter === "all" ? "All statuses" : statusFilter}`,
      `Search Query: ${searchQuery || "None"}`,
      "",
      "Summary",
      `Total Records: ${stats.totalRecords}`,
      `Total Collected: ${formatCurrency(stats.totalCollected)}`,
      `Pending Amount: ${formatCurrency(stats.pendingAmount)}`,
      `Overdue Amount: ${formatCurrency(stats.overdueAmount)}`,
      `Paid Count: ${stats.paidCount}`,
      `Pending Count: ${stats.pendingCount}`,
      `Overdue Count: ${stats.overdueCount}`,
      `Collection Rate: ${stats.collectionRate}%`,
      "",
      "Payments",
      ...filteredPayments.map(
        (payment, index) =>
          `${index + 1}. ${getStudentName(payment)} | Room ${getRoomLabel(payment)} | ${payment.month} ${payment.year} | ${formatCurrency(payment.amount)} | ${payment.status.toUpperCase()} | ${payment.description}`
      ),
    ];

    downloadTextFile(
      reportLines.join("\n"),
      `payment-report-${monthFilter === "all" ? "all" : monthFilter}.txt`
    );
  };

  const exportSinglePayment = (payment: Payment) => {
    const receipt = [
      "Payment Receipt",
      `Student: ${getStudentName(payment)}`,
      `Room: ${getRoomLabel(payment)}`,
      `Description: ${payment.description}`,
      `Month: ${payment.month} ${payment.year}`,
      `Amount: ${formatCurrency(payment.amount)}`,
      `Status: ${payment.status}`,
      `Due Date: ${payment.dueDate ? format(new Date(payment.dueDate), "dd MMM yyyy") : "-"}`,
      `Paid At: ${payment.paidAt ? format(new Date(payment.paidAt), "dd MMM yyyy hh:mm a") : "-"}`,
    ].join("\n");

    downloadTextFile(receipt, `payment-${payment._id}.txt`);
  };

  const handleCreatePayment = async () => {
    if (!formData.student || !formData.amount || !formData.month || !formData.year) {
      toast({
        title: "Missing fields",
        description: "Student, amount, month, and year are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await API.post("/payments", {
        student: formData.student,
        amount: Number(formData.amount),
        month: formData.month,
        year: Number(formData.year),
        dueDate: formData.dueDate || undefined,
        description: formData.description || "Hostel Rent",
        status: formData.status,
        paidAt: formData.status === "paid" ? new Date().toISOString() : undefined,
      });

      toast({
        title: "Payment created",
        description: "The payment entry has been added successfully.",
      });

      setCreateDialogOpen(false);
      setFormData(defaultFormState);
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create payment",
        description: "Please check the form and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await API.put(`/payments/${paymentId}/pay`);
      toast({
        title: "Payment updated",
        description: "The payment has been marked as paid.",
      });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update payment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const confirmed = window.confirm("Delete this payment record?");
    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/payments/${paymentId}`);
      toast({
        title: "Payment deleted",
        description: "The payment record has been removed.",
      });
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to delete payment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Payment Management</h1>
            <p className="page-subtitle">
              Track and manage hostel rent payments across {activeMonthLabel.toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select
                      value={formData.student}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, student: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedStudents.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} ({student.room?.number || "No room"}) {student.room?.rent ? `- Rs. ${student.room.rent}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudent?.room && (
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                      <p className="font-medium">
                        Room {selectedStudent.room.number} | {selectedStudent.room.capacity}-sharing
                      </p>
                      <p className="text-muted-foreground">
                        Admin price: Rs. {selectedStudent.room.rent.toLocaleString()} per month
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, amount: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Select
                        value={formData.month}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, month: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthNames.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        min="2020"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, year: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePayment} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Payment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={generateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={() => exportPayments(filteredPayments)}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-2 border-success/20 bg-success/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Collected
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {stats.totalCollected.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-success">
              {stats.paidCount} payments received
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-warning/20 bg-warning/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {stats.pendingAmount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-warning">
              {stats.pendingCount} payment{stats.pendingCount === 1 ? "" : "s"} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Overdue
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {stats.overdueAmount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {stats.overdueCount} payment{stats.overdueCount === 1 ? "" : "s"} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collection Rate
            </CardDescription>
            <CardTitle className="text-2xl">{stats.collectionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{activeMonthLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by student, room, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="all" className="mt-0">
              <PaymentTable
                payments={filteredPayments}
                getStatusBadge={getStatusBadge}
                onDownload={exportSinglePayment}
                onMarkAsPaid={handleMarkAsPaid}
                onDelete={handleDeletePayment}
              />
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              <PaymentTable
                payments={filteredPayments.filter((payment) => payment.status === "pending")}
                getStatusBadge={getStatusBadge}
                onDownload={exportSinglePayment}
                onMarkAsPaid={handleMarkAsPaid}
                onDelete={handleDeletePayment}
              />
            </TabsContent>
            <TabsContent value="overdue" className="mt-0">
              <PaymentTable
                payments={filteredPayments.filter((payment) => payment.status === "overdue")}
                getStatusBadge={getStatusBadge}
                onDownload={exportSinglePayment}
                onMarkAsPaid={handleMarkAsPaid}
                onDelete={handleDeletePayment}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </DashboardLayout>
  );
}

function PaymentTable({
  payments,
  getStatusBadge,
  onDownload,
  onMarkAsPaid,
  onDelete,
}: {
  payments: Payment[];
  getStatusBadge: (status: string) => JSX.Element;
  onDownload: (payment: Payment) => void;
  onMarkAsPaid: (paymentId: string) => void;
  onDelete: (paymentId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
    <Table className="min-w-[980px]">
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Billing Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Due/Paid Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length > 0 ? (
          payments.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell className="font-medium">{getStudentName(payment)}</TableCell>
              <TableCell>{getRoomLabel(payment)}</TableCell>
              <TableCell>{payment.description || "-"}</TableCell>
              <TableCell>
                {payment.month} {payment.year}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>{formatPaymentDate(payment)}</TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onDownload(payment)}>
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                  {payment.status !== "paid" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsPaid(payment._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(payment._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center py-8 text-muted-foreground"
            >
              No payments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
