import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComplaintStatusBadge } from '@/components/dashboard/ComplaintStatusBadge';
import API from '@/lib/api';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MessageSquareWarning } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Complaint } from '@/types';

export default function ComplaintManagement() {
const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

useEffect(() => {
  fetchComplaints();
}, []);

const fetchComplaints = async () => {
  try {
    const res = await API.get("/complaints");
    setComplaints(res.data);
  } catch (error) {
    console.log("Error fetching complaints");
  }
};

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     complaint.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesType = filterType === 'all' || complaint.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

const updateStatus = async (id: string, newStatus: Complaint['status']) => {
  try {

    await API.put(`/complaints/${id}`, {
      status: newStatus
    });

    setComplaints(prev =>
      prev.map(c =>
        c._id === id
          ? { ...c, status: newStatus }
          : c
      )
    );

    toast.success(`Complaint status updated to ${newStatus}`);

  } catch (error) {
    console.log("Error updating complaint");
    toast.error("Failed to update complaint status");
  }
};

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Complaint Management</h1>
        <p className="page-subtitle">Review and resolve student complaints</p>
      </div>

      {/* Filters */}
      <div className="dashboard-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
              <SelectItem value="cleanliness">Cleanliness</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead>Complaint</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.map(complaint => (
              <TableRow key={complaint._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{complaint.title}</span>
                  </div>
                </TableCell>
                <TableCell>{complaint.student?.name}</TableCell>
                <TableCell>{complaint.roomNumber}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-muted rounded-full text-xs capitalize">
                    {complaint.type}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <ComplaintStatusBadge status={complaint.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={complaint.status}
                    onValueChange={(value) => updateStatus(complaint._id, value as Complaint['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
