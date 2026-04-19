import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import MyRoom from "./pages/student/MyRoom";
import Complaints from "./pages/student/Complaints";
import Notices from "./pages/student/Notices";
import RentPayment from "./pages/student/RentPayment";

// Warden
import WardenDashboard from "./pages/warden/WardenDashboard";
import ManageRooms from "./pages/warden/ManageRooms";
import ComplaintManagement from "./pages/warden/ComplaintManagement";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import RoomsManagement from "./pages/admin/RoomsManagement";
import NoticesManagement from "./pages/admin/NoticesManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";

import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/room" element={<MyRoom />} />
            <Route path="/student/complaints" element={<Complaints />} />
            <Route path="/student/notices" element={<Notices />} />
            <Route path="/student/payments" element={<RentPayment />} />
            
            {/* Warden Routes */}
            <Route path="/warden" element={<WardenDashboard />} />
            <Route path="/warden/rooms" element={<ManageRooms />} />
            <Route path="/warden/complaints" element={<ComplaintManagement />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/rooms" element={<RoomsManagement />} />
            <Route path="/admin/notices" element={<NoticesManagement />} />
            <Route path="/admin/payments" element={<PaymentManagement />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
            <Route path="/profile" element={<Profile />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
