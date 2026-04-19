import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import API from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building2, MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Room, Student } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const emptyRoomForm = {
  number: '',
  block: 'A',
  floor: '1',
  capacity: '3',
  rent: '',
};

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState(emptyRoomForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/students'),
      ]);
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    }
  };

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBlock = filterBlock === 'all' || room.block === filterBlock;
        return matchesSearch && matchesBlock;
      }),
    [rooms, searchQuery, filterBlock]
  );

  const blocks = [...new Set(rooms.map((room) => room.block))];

  const roomStudents = useMemo(
    () => students.filter((student) => student.room?._id === viewingRoom?._id),
    [students, viewingRoom]
  );

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post('/rooms', {
        number: newRoom.number,
        block: newRoom.block,
        floor: parseInt(newRoom.floor),
        capacity: parseInt(newRoom.capacity),
        rent: parseInt(newRoom.rent),
      });

      toast.success('Room added successfully!');
      setNewRoom(emptyRoomForm);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to add room');
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      await API.put(`/rooms/${editingRoom._id}`, editingRoom);
      toast.success('Room updated successfully!');
      setEditingRoom(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Delete room ${room.number}?`)) {
      return;
    }

    try {
      await API.delete(`/rooms/${room._id}`);
      toast.success('Room deleted successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete room');
    }
  };

  const getOccupancyStatus = (room: Room) => {
    if (room.occupied === 0) return { label: 'Vacant', variant: 'success' as const };
    if (room.occupied < room.capacity) return { label: 'Partial', variant: 'warning' as const };
    return { label: 'Full', variant: 'destructive' as const };
  };

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Room Management</h1>
          <p className="page-subtitle">Add and manage hostel rooms and sharing-wise pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  placeholder="e.g., A-104"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Select value={newRoom.block} onValueChange={(value) => setNewRoom({ ...newRoom, block: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Block A</SelectItem>
                      <SelectItem value="B">Block B</SelectItem>
                      <SelectItem value="C">Block C</SelectItem>
                      <SelectItem value="D">Block D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Select value={newRoom.floor} onValueChange={(value) => setNewRoom({ ...newRoom, floor: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((floor) => (
                        <SelectItem key={floor} value={String(floor)}>Floor {floor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sharing Capacity</Label>
                  <Select value={newRoom.capacity} onValueChange={(value) => setNewRoom({ ...newRoom, capacity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((cap) => (
                        <SelectItem key={cap} value={String(cap)}>{cap}-sharing</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 8500"
                    value={newRoom.rent}
                    onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="dashboard-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBlock} onValueChange={setFilterBlock}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Blocks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block} value={block}>Block {block}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Sharing</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room) => {
              const status = getOccupancyStatus(room);
              return (
                <TableRow key={room._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{room.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>Block {room.block}</TableCell>
                  <TableCell>Floor {room.floor}</TableCell>
                  <TableCell>{room.capacity}-sharing</TableCell>
                  <TableCell>Rs. {room.rent.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {room.occupied}/{room.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={status.variant === 'success' ? 'default' : status.variant === 'warning' ? 'secondary' : 'destructive'}
                      className={status.variant === 'success' ? 'bg-success hover:bg-success/80' : ''}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Room & Rent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewingRoom(room)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Students
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRoom(room)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>

      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <form onSubmit={handleUpdateRoom} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={editingRoom.number}
                  onChange={(e) => setEditingRoom({ ...editingRoom, number: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Input
                    value={editingRoom.block}
                    onChange={(e) => setEditingRoom({ ...editingRoom, block: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingRoom.floor}
                    onChange={(e) => setEditingRoom({ ...editingRoom, floor: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sharing Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingRoom.rent}
                    onChange={(e) => setEditingRoom({ ...editingRoom, rent: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingRoom(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Room</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRoom} onOpenChange={(open) => !open && setViewingRoom(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Students in {viewingRoom?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {roomStudents.length > 0 ? roomStudents.map((student) => (
              <div key={student._id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No students assigned to this room.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
