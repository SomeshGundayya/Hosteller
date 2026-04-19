// import { useAuth } from "@/contexts/AuthContext";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { useEffect, useState } from "react";
// import API from "@/lib/api";
// import { Student } from "@/types";
// import { Button } from "@/components/ui/button";

// export default function Profile() {

//   const { user } = useAuth();
//   const [student, setStudent] = useState<Student | null>(null);

//   useEffect(() => {
//     if (!user?.email) return;

//     const fetchStudent = async () => {
//       try {
//         const res = await API.get(`/students/email/${user.email}`);
//         setStudent(res.data);
//       } catch (error) {
//         console.log("Error fetching profile");
//       }
//     };

//     fetchStudent();
//   }, [user]);

//   return (
//     <DashboardLayout>
//       <div className="page-header">
//         <h1 className="page-title">My Profile</h1>
//         <p className="page-subtitle">View your personal information</p>
//       </div>

//       <div className="dashboard-card max-w-2xl">
//         <div className="space-y-4">

//           <div>
//             <p className="text-sm text-muted-foreground">Name</p>
//             <p className="text-lg font-medium">{user?.name}</p>
//           </div>

//           <div>
//             <p className="text-sm text-muted-foreground">Email</p>
//             <p className="text-lg font-medium">{user?.email}</p>
//           </div>

//           <div>
//             <p className="text-sm text-muted-foreground">Role</p>
//             <p className="text-lg font-medium capitalize">{user?.role}</p>
//           </div>

//           <div>
//             <p className="text-sm text-muted-foreground">Room</p>
//             <p className="text-lg font-medium">
//               {student?.room?.number || "Not Assigned"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-muted-foreground">Phone</p>
//             <p className="text-lg font-medium">
//               {student?.phone || "Not Available"}
//             </p>
//           </div>

//           <Button className="mt-4">Edit Profile</Button>

//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }

import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    if (!user?.email) return;

    const fetchStudent = async () => {
      try {
        const res = await API.get(`/students/email/${user.email}`);
        setStudent(res.data);

        // ✅ Set initial phone
        setFormData({
          name: user.name,
          phone: res.data.phone || "",
          avatar: user.avatar || "",
        });

      } catch (error) {
        console.log("Error fetching profile");
      }
    };

    fetchStudent();
  }, [user]);

  // ✅ UPDATE FUNCTION
  const handleUpdate = async () => {
    try {
      const res = await API.put("/auth/update-profile", formData);

      // update localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      setIsEditing(false);
      toast.success("Profile updated successfully");

      // refresh UI
      setStudent((prev) => prev && { ...prev, ...formData });

    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View your personal information</p>
      </div>

      <div className="dashboard-card max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-2">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={isEditing ? formData.avatar : user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* NAME */}
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <p className="text-lg font-medium">{user?.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>

          {/* ROLE */}
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="text-lg font-medium capitalize">{user?.role}</p>
          </div>

          {/* ROOM */}
          <div>
            <p className="text-sm text-muted-foreground">Room</p>
            <p className="text-lg font-medium">
              {student?.room?.number || "Not Assigned"}
            </p>
          </div>

          {/* PHONE */}
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            ) : (
              <p className="text-lg font-medium">
                {student?.phone || "Not Available"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Profile Picture</p>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Input
                  placeholder="Or paste image URL"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                />
              </div>
            ) : (
              <p className="text-lg font-medium">
                {user?.avatar ? "Profile picture added" : "Not Added"}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-4 flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate}>Save</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
