import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Link } from "react-router-dom";
// import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface TopNavProps {
  sidebarCollapsed?: boolean;
}

export function TopNav({ sidebarCollapsed = false }: TopNavProps) {
  const { user, logout, switchRole } = useAuth();
  const [notices, setNotices] = useState([]);

useEffect(() => {
  const fetchNotices = async () => {
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch (error) {
      console.log("Error fetching notices");
    }
  };

  fetchNotices();
}, []);


  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header 
      className="fixed top-0 right-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarCollapsed ? '5rem' : '16rem' }}
    >
      {/* Search */}
      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search..." 
          className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Role Switcher (for demo) */}
        <DropdownMenu>
          {/* <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              Switch Role (Demo)
            </Button>
          </DropdownMenuTrigger> */}
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchRole('student')}>
              Student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('warden')}>
              Warden
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('admin')}>
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
       <Link to="/student/notices">
  <Button variant="ghost" size="icon" className="relative">
    <Bell className="w-5 h-5" />
    
    {notices.length > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
        {notices.length}
      </span>
    )}
    
  </Button>
</Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
  <Link to="/profile">
    <User className="w-4 h-4 mr-2" />
    Profile
  </Link>
</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
