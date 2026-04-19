import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Student } from "@/types";
import { BedDouble, Users, Building2, Layers } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';



export default function MyRoom() {

const { user } = useAuth();

const [student, setStudent] = useState<Student | null>(null);
useEffect(() => {
  if (!user?.email) return;

  const fetchStudent = async () => {
    try {
      const res = await API.get(`/students/email/${user.email}`);
      setStudent(res.data);
    } catch (error) {
      console.log("Error fetching student");
    }
  };

  fetchStudent();
}, [user]);

  
  const myRoom = student?.room;
 const roommates =
  myRoom?.students?.filter((s) => s._id !== student?._id) || [];
  // const roommates = myRoom?.students
  //   .filter(id => id !== user?.id)
  //   .map(id => mockUsers.find(u => u.id === id))
  //   .filter(Boolean) || [];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Room</h1>
        <p className="page-subtitle">View your room details and roommates</p>
      </div>

      {myRoom ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Room Details */}
          <div className="lg:col-span-2 dashboard-card">
            <h2 className="text-lg font-semibold mb-6">Room Information</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BedDouble className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Number</p>
                  <p className="text-xl font-bold text-foreground">{myRoom.number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-info/5 rounded-xl">
                <div className="p-3 bg-info/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block</p>
                  <p className="text-xl font-bold text-foreground">Block {myRoom?.block}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-xl">
                <div className="p-3 bg-warning/10 rounded-xl">
                  <Layers className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="text-xl font-bold text-foreground">Floor {myRoom?.floor}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-success/5 rounded-xl">
                <div className="p-3 bg-success/10 rounded-xl">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-xl font-bold text-foreground">{myRoom?.occupied} / {myRoom?.capacity}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl">
                <div className="p-3 bg-secondary rounded-xl">
                  <BedDouble className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-xl font-bold text-foreground">
                    Rs. {myRoom?.rent?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roommates */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold mb-6">Roommates</h2>
            
            {roommates.length > 0 ? (
              <div className="space-y-4">
                {roommates.map((mate) => (
                  <div key={mate._id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={mate.avatar} alt={mate.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {mate.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{mate.name || "Unknown Student"}</p>
                      <p className="text-sm text-muted-foreground">{mate.email || "No Email"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No roommates yet</p>
                <p className="text-sm mt-1">You have the room to yourself!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-card text-center py-12">
          <BedDouble className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Room Assigned</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't been assigned a room yet. Please contact the hostel administration for room allocation.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
