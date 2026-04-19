import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Link } from "react-router-dom";

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
  onOpenMobileSidebar: () => void;
}

export function TopNav({ sidebarCollapsed = false, onOpenMobileSidebar }: TopNavProps) {
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

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();
  const noticeLink =
    user.role === 'admin'
      ? '/admin/notices'
      : user.role === 'warden'
        ? '/warden/complaints'
        : '/student/notices';

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 transition-all duration-300 left-0 ${
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative hidden md:block w-full max-w-xs lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <DropdownMenu>
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

        <Link to={noticeLink}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notices.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {notices.length}
              </span>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 max-w-[180px] md:max-w-none">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left truncate">
                <p className="text-sm font-medium truncate">{user.name}</p>
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
