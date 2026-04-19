import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { mockComplaints, mockRooms } from '@/data/mockData';
import { Users, Building2, MessageSquareWarning, CheckCircle, Bell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AdminDashboard() {

const [complaints, setComplaints] = useState([]);
const [rooms, setRooms] = useState([]);

  const [stats, setStats] = useState({
  totalRooms: 0,
  totalStudents: 0,
  totalBeds: 0,
  occupiedBeds: 0,
  availableBeds: 0
});
  
useEffect(() => {
  fetchStats();
  fetchComplaints();
  fetchRooms();
}, []);


const fetchStats = async () => {
  try {
    const res = await API.get("/dashboard");
    setStats(res.data);
  } catch (error) {
    console.log("Error fetching dashboard stats");
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

const fetchRooms = async () => {
  try {
    const res = await API.get("/rooms");
    setRooms(res.data);
  } catch (error) {
    console.log("Error fetching rooms");
  }
};

  const complaintsByType = [
  {
    name: 'Water',
    value: complaints.filter(c => c.type === 'water').length,
    color: 'hsl(199, 89%, 48%)'
  },
  {
    name: 'Electricity',
    value: complaints.filter(c => c.type === 'electricity').length,
    color: 'hsl(38, 92%, 50%)'
  },
  {
    name: 'Cleanliness',
    value: complaints.filter(c => c.type === 'cleanliness').length,
    color: 'hsl(142, 76%, 36%)'
  },
  {
    name: 'Maintenance',
    value: complaints.filter(c => c.type === 'maintenance').length,
    color: 'hsl(0, 84%, 60%)'
  }
];

const roomsByBlock = [...new Set(rooms.map(r => r.block))].map(block => {
  const blockRooms = rooms.filter(r => r.block === block);

  return {
    block: `Block ${block}`,
    occupied: blockRooms.reduce((acc, r) => acc + r.occupied, 0),
    vacant: blockRooms.reduce((acc, r) => acc + (r.capacity - r.occupied), 0),
  };
});


  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of the hostel management system</p>
      </div>

      {/* Stats Grid */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={Building2}
          variant="info"
        />
        <StatCard
          title="Open Complaints"
          value={0}
          icon={MessageSquareWarning}
          variant="warning"
        />
        <StatCard
          title="Resolved"
          value={0}
          icon={CheckCircle}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
  title="Available Beds"
  value={stats.availableBeds}
  icon={Building2}
  variant="success"
/>
  <StatCard
    title="Occupied Beds"
    value={stats.occupiedBeds}
    icon={Users}
    variant="warning"
  />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Complaints by Type */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold mb-6">Complaints by Type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Occupancy by Block */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold mb-6">Room Occupancy by Block</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomsByBlock}>
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="hsl(210, 79%, 46%)" name="Occupied" />
                <Bar dataKey="vacant" fill="hsl(142, 76%, 36%)" name="Vacant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/users">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/rooms">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Building2 className="w-6 h-6" />
              Manage Rooms
            </Button>
          </Link>
          <Link to="/admin/notices">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Bell className="w-6 h-6" />
              Post Notice
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex-col gap-2">
            <TrendingUp className="w-6 h-6" />
            View Reports
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
