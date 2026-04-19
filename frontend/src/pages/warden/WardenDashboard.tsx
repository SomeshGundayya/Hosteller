import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ComplaintStatusBadge } from '@/components/dashboard/ComplaintStatusBadge';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Room, Complaint, Student } from '@/types';
import { Users, Building2, MessageSquareWarning, CheckCircle, BedDouble, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function WardenDashboard() {

const [rooms, setRooms] = useState<Room[]>([]);
const [complaints, setComplaints] = useState<Complaint[]>([]);
const [students, setStudents] = useState<Student[]>([]);

useEffect(() => {

  fetchRooms();
  fetchStudents();
  fetchComplaints();

  const interval = setInterval(() => {
    fetchComplaints();
  }, 3000);

  return () => clearInterval(interval);

}, []);

const fetchRooms = async () => {
  try {
    const res = await API.get("/rooms");
    setRooms(res.data);
  } catch (error) {
    console.log("Error fetching rooms");
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

const fetchStudents = async () => {
  try {
    const res = await API.get("/students");
    setStudents(res.data);
  } catch (error) {
    console.log("Error fetching students");
  }
};

const pendingComplaints = complaints.filter(
  c => c.status !== "resolved"
);
const vacantRooms = rooms.filter(r => r.occupied < r.capacity);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Warden Dashboard</h1>
        <p className="page-subtitle">Monitor hostel activities and manage operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Rooms"
          value={rooms.length}
          icon={Building2}
          variant="info"
        />
        <StatCard
          title="Vacant Rooms"
          value={vacantRooms.length}
          icon={BedDouble}
          variant="success"
        />
        <StatCard
          title="Open Complaints"
          value={pendingComplaints.length}
          icon={MessageSquareWarning}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Complaints */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pending Complaints
            </h2>
            <Link to="/warden/complaints">
              <Button variant="outline" size="sm">Manage All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {pendingComplaints.slice(0, 4).map(complaint => (
              <div key={complaint._id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{complaint.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {complaint.student?.name} • Room {complaint.roomNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(complaint.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Room Availability */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-success" />
              Available Rooms
            </h2>
            <Link to="/warden/rooms">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {vacantRooms.slice(0, 5).map(room => (
              <div key={room._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Room {room.number}</p>
                    <p className="text-sm text-muted-foreground">Block {room.block}, Floor {room.floor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{room.capacity - room.occupied} vacant</p>
                  <p className="text-xs text-muted-foreground">of {room.capacity} beds</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
