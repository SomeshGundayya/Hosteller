import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import API from "@/lib/api";
import { useEffect } from "react";
import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Room } from "@/types";

export default function ManageRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBlock, setFilterBlock] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      console.log("Error fetching rooms");
    }
  };

  // const fetchStudents = async () => {
  //   try {
  //     const res = await API.get("/students");
  //     setStudents(res.data);
  //   } catch (error) {
  //     console.log("Error fetching students");
  //   }
  // };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      console.log("Students:", res.data);
      setStudents(res.data);
    } catch (error) {
      console.log("Error fetching students");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBlock = filterBlock === "all" || room.block === filterBlock;
    return matchesSearch && matchesBlock;
  });

  const blocks = [...new Set(rooms.map((r) => r.block))];

  const getOccupancyStatus = (room: Room) => {
    if (room.occupied === 0)
      return { label: "Vacant", variant: "success" as const };
    if (room.occupied < room.capacity)
      return { label: "Partial", variant: "warning" as const };
    return { label: "Full", variant: "destructive" as const };
  };

  const handleAllocate = async (roomId: string) => {
    try {
      await API.put(`/students/${selectedStudent}/allocate-room`, {
        roomId,
      });

      toast.success("Student allocated successfully!");

      setIsDialogOpen(false);
      setSelectedStudent("");

      fetchRooms();
      fetchStudents();
    } catch (error) {
      toast.error("Allocation failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Manage Rooms</h1>
        <p className="page-subtitle">
          View room occupancy and allocate students
        </p>
      </div>

      {/* Filters */}
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
                <SelectItem key={block} value={block}>
                  Block {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Floor</TableHead>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {room.number}
                    </div>
                  </TableCell>
                  <TableCell>Block {room.block}</TableCell>
                  <TableCell>Floor {room.floor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(room.occupied / room.capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {room.occupied}/{room.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status.variant === "success"
                          ? "default"
                          : status.variant === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        status.variant === "success"
                          ? "bg-success hover:bg-success/80"
                          : ""
                      }
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={isDialogOpen && selectedRoom?._id === room._id}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) {
                          setSelectedRoom(room);
                          setSelectedStudent("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={room.occupied >= room.capacity}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Allocate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Allocate Student to Room {room.number}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <p className="text-muted-foreground">
                            Select a student to allocate to this room. Available
                            spots: {room.capacity - room.occupied}
                          </p>
                          <Select
                            value={selectedStudent}
                            onValueChange={(value) => setSelectedStudent(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students
                                .filter((student) => !student.room?._id)
                                .map((student) => (
                                  <SelectItem
                                    key={student._id}
                                    value={student._id}
                                  >
                                    {student.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={!selectedStudent}
                              onClick={() => handleAllocate(room._id)}
                            >
                              Allocate
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
