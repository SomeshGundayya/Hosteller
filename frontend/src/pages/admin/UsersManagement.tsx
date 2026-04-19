import { useEffect, useMemo, useState } from 'react';
import API from '@/lib/api';
import { Student, Room, UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, MoreHorizontal, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

const emptyStudentForm = {
  name: '',
  email: '',
  phone: '',
  roomId: '',
};

export default function UsersManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [roleStudent, setRoleStudent] = useState<Student | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newStudent, setNewStudent] = useState(emptyStudentForm);
  const [editForm, setEditForm] = useState(emptyStudentForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        API.get('/students'),
        API.get('/rooms'),
      ]);

      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.room?.number || '').toLowerCase().includes(query)
        );
      }),
    [students, searchQuery]
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post('/students', newStudent);
      toast.success('Student added successfully!');
      setIsCreateDialogOpen(false);
      setNewStudent(emptyStudentForm);
      loadData();
    } catch (error) {
      toast.error('Failed to add student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Delete this student?')) {
      return;
    }

    try {
      await API.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      roomId: student.room?._id || '',
    });
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await API.put(`/students/${editingStudent._id}`, editForm);
      toast.success('Student updated successfully');
      setEditingStudent(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  const openRoleDialog = (student: Student) => {
    setRoleStudent(student);
    setNewRole((student.role as UserRole) || 'student');
  };

  const handleChangeRole = async () => {
    if (!roleStudent) return;

    try {
      await API.put(`/students/${roleStudent._id}`, {
        name: roleStudent.name,
        email: roleStudent.email,
        phone: roleStudent.phone || '',
        roomId: roleStudent.room?._id,
        role: newRole,
      });
      toast.success('Role updated successfully');
      setRoleStudent(null);
      loadData();
    } catch (error) {
      toast.error('Failed to change role');
    }
  };

  const renderStudentForm = (
    form: typeof emptyStudentForm,
    setForm: React.Dispatch<React.SetStateAction<typeof emptyStudentForm>>
  ) => (
    <>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="john@hostel.edu"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          placeholder="9876543210"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Select Room</Label>
        <Select value={form.roomId} onValueChange={(value) => setForm((prev) => ({ ...prev, roomId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room._id} value={room._id}>
                {room.number} ({room.occupied}/{room.capacity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">Manage hostel students</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-5 mt-4">
              {renderStudentForm(newStudent, setNewStudent)}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Student</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="dashboard-card mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                <TableCell>{student.room ? student.room.number : '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(student.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(student)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRoleDialog(student)}>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteStudent(student._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-5 mt-4">
            {renderStudentForm(editForm, setEditForm)}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleStudent} onOpenChange={(open) => !open && setRoleStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Change role for {roleStudent?.name}
            </p>
            <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="warden">Warden</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setRoleStudent(null)}>
                Cancel
              </Button>
              <Button onClick={handleChangeRole}>Update Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
