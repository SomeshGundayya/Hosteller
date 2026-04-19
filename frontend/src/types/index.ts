export type UserRole = 'student' | 'warden' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  roomNumber?: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  number: string;
  block: string;
  floor: number;
  capacity: number;
  rent: number;
  occupied: number;
  students: string[];
}
export interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  room?: {
  _id: string;
  number: string;
  block: string;
  floor: number;
  capacity: number;
  rent: number;
  occupied: number;
  students: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
};
  createdAt: string;
}

export interface Complaint {
  _id: string;

  student?: {
    _id: string;
    name: string;
  };

  roomNumber: string;
  title: string;

  type: "water" | "electricity" | "cleanliness" | "maintenance" | "other";

  description: string;

  status: "pending" | "resolved";

  createdAt: string;
}

export interface Notice {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  author?: string;
  authorRole?: UserRole;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export interface Payment {
  _id: string;
   student: {
    _id: string;
    name: string;
    room?: {
      number: string;
    };
  };
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

export interface PaymentHistory {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  year: number;
  paidAt: string;
  status: 'paid';
  description: string;
  transactionId: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
}
