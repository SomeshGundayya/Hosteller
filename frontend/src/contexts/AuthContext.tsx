import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import API from "@/lib/api";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  roomNumber: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      return res.data.user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      return null;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await API.post("/auth/register", data);
      return true;
    } catch (error: unknown) {
      console.log("Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!user) {
      return;
    }

    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsAuthReady(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isAuthReady,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
