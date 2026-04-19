import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComplaintStatusBadge } from '@/components/dashboard/ComplaintStatusBadge';
import API from '@/lib/api';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MessageSquareWarning } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Complaint, Student } from '@/types';

export default function Complaints() {

const [complaints, setComplaints] = useState<Complaint[]>([]);
const [student, setStudent] = useState<Student | null>(null);
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    type: 'water',
    title: '',
    description: '',
  });

// useEffect(() => {
//   fetchComplaints();

//   if (user?._id) {
//     fetchStudent();
//   }

// }, [user]);


useEffect(() => {
  fetchComplaints();

  if (user?.role === "student") {
    fetchStudent();
  }

}, [user]);

const fetchComplaints = async () => {
  try {
    const res = await API.get("/complaints");
    setComplaints(res.data);
  } catch (error) {
    console.log("Error fetching complaints");
  }
};


const fetchStudent = async () => {
  try {

   const res = await API.get(`/students/email/${user?.email}`);

    setStudent(res.data);

  } catch (error) {
    console.log("Error fetching student");
  }
};

  const myComplaints = complaints.filter(
  (c) => c.student?._id === user?._id
);

  const handleSubmit = async (e: React.FormEvent) => {
  
  e.preventDefault();

   if (!user?._id) {
    toast.error("User not found");
    return;
  }


  console.log("Complaint Data:", {
    student:  student?._id,
   roomNumber: student?.room?.number,
    title: newComplaint.title,
    type: newComplaint.type,
    description: newComplaint.description
  });

  try {

if (!student?.room?.number) {
  toast.error("Room not assigned");
  return;
}

   await API.post("/complaints", {
  student: student?._id,
 roomNumber: student?.room?.number,
  title: newComplaint.title,
  type: newComplaint.type,
  description: newComplaint.description
});

    toast.success("Complaint submitted successfully");

    setNewComplaint({
      type: "water",
      title: "",
      description: ""
    });

    setIsDialogOpen(false);

    fetchComplaints();

  } catch (error) {
    toast.error("Failed to submit complaint");
  }
};

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">Submit and track your complaints</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Complaint Type</Label>
                <Select 
                  value={newComplaint.type}
                  onValueChange={(value) => setNewComplaint({ ...newComplaint, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Provide detailed information about the issue..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Complaint</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {myComplaints.length > 0 ? (
        <div className="space-y-4">
          {myComplaints.map(complaint => (
            <div key={complaint._id} className="dashboard-card">
           <div className="flex items-center gap-3 mb-2">
  <h3 className="font-semibold text-foreground capitalize">
    {complaint.title || "Complaint"}
  </h3>

  <ComplaintStatusBadge status={complaint.status} />
</div>

<p className="text-muted-foreground text-sm mb-3">
  Room: {complaint.roomNumber}
</p>

<div className="flex items-center gap-4 text-xs text-muted-foreground">
  <span className="px-2 py-1 bg-muted rounded-full capitalize">
    {complaint.type}
  </span>

  <span>Student: {complaint.student?.name}</span>

  <span>
    Filed: {format(new Date(complaint.createdAt), "MMM d, yyyy h:mm a")}
  </span>
</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-card text-center py-12">
          <MessageSquareWarning className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Complaints</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't submitted any complaints yet. If you're facing any issues, click the button below.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Submit a Complaint
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
