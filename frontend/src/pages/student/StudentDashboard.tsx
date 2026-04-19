import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { NoticeCard } from '@/components/dashboard/NoticeCard';
import { ComplaintStatusBadge } from '@/components/dashboard/ComplaintStatusBadge';
import API from "@/lib/api";
import { useState, useEffect } from "react";
import { Student, Complaint,Notice} from "@/types";
import { BedDouble, MessageSquareWarning, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';


export default function StudentDashboard() {
  const { user } = useAuth();
  
const [student, setStudent] = useState<Student | null>(null);
const [complaints, setComplaints] = useState<Complaint[]>([]);
const [notices, setNotices] = useState<Notice[]>([]);

// useEffect(() => {
//   fetchStudent();
//   fetchComplaints();
// }, []);

useEffect(() => {
  if (!user) return;

  fetchComplaints();
  fetchNotices();
  if (user.role === "student") {
    fetchStudent();
  }
}, [user]);

const fetchStudent = async () => {
  try {
    const res = await API.get(`/students/email/${user?.email}`);
    setStudent(res.data);
  } catch (error) {
    console.log("Error fetching student");
  }
};

const fetchComplaints = async () => {
  try {
    const res = await API.get("/complaints");
    setComplaints(res.data);
  } catch (error) {
    console.log("Error fetching complaints");
  }
};

const fetchNotices = async () => {
  try {
    const res = await API.get("/notices");
    setNotices(res.data);
  } catch (error) {
    console.log("Error fetching notices");
  }
};

 const myRoom = student?.room;
const myComplaints = complaints.filter(
  (c) => c.student?._id === student?._id
);
  const pendingComplaints = myComplaints.filter(c => c.status === 'pending').length;
 const latestNotices = notices.slice(0, 2);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">Here's what's happening in your hostel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="My Room"
          value={student?.room?.number || "Not Assigned"}
          icon={BedDouble}
          variant="primary"
        />
        <StatCard
          title="Room Capacity"
      value={myRoom ? `${myRoom.occupied}/${myRoom.capacity}` : "-"}
          icon={BedDouble}
          variant="info"
        />
        <StatCard
          title="Open Complaints"
          value={pendingComplaints}
          icon={MessageSquareWarning}
          variant="warning"
        />
        <StatCard
          title="Resolved"
          value={myComplaints.filter(c => c.status === 'resolved').length}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Complaints */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">My Complaints</h2>
            <Link to="/student/complaints">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {myComplaints.length > 0 ? (
            <div className="space-y-4">
              {myComplaints.slice(0, 3).map(complaint => (
                <div key={complaint._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{complaint.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{complaint.type}</p>
                  </div>
                  <ComplaintStatusBadge status={complaint.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquareWarning className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No complaints filed yet</p>
              <Link to="/student/complaints">
                <Button variant="link" className="mt-2">File a complaint</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Latest Notices */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Latest Notices</h2>
            <Link to="/student/notices">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {latestNotices.map(notice => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
