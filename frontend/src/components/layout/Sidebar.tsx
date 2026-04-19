import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  BedDouble,
  MessageSquareWarning,
  Bell,
  Users,
  Building2,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  Menu,
  CreditCard,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/room', icon: BedDouble, label: 'My Room' },
  { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { to: '/student/notices', icon: Bell, label: 'Notices' },
  { to: '/student/payments', icon: CreditCard, label: 'Rent Payment' },
];

const wardenLinks = [
  { to: '/warden', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/warden/rooms', icon: Building2, label: 'Manage Rooms' },
  { to: '/warden/complaints', icon: MessageSquareWarning, label: 'Complaints' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/rooms', icon: Building2, label: 'Rooms' },
  { to: '/admin/notices', icon: Bell, label: 'Notices' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = user.role === 'student'
    ? studentLinks
    : user.role === 'warden'
      ? wardenLinks
      : adminLinks;

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const initials = user.name.split(' ').map((part) => part[0]).join('').toUpperCase();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
          "w-72 lg:w-64",
          collapsed && "lg:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Home className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-lg">HostelHive</h1>
                <p className="text-xs text-sidebar-foreground/60">{roleLabel} Portal</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:inline-flex"
              onClick={onToggleCollapse}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
              onClick={onCloseMobile}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={cn(
                  "nav-link",
                  isActive && "active",
                  collapsed && "lg:justify-center lg:px-2"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {(!collapsed || mobileOpen) && (
            <div className="mb-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-sidebar-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "lg:px-2"
            )}
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
