import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardList,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Leaf,
  UserPlus,
  BarChart3,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Admin items
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Managers', path: '/admin/managers', icon: Users, roles: ['admin'] },
  { label: 'Workers', path: '/admin/workers', icon: UserPlus, roles: ['admin'] },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban, roles: ['admin'] },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
  
  // Manager items
  { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, roles: ['manager'] },
  { label: 'Projects', path: '/manager/projects', icon: FolderKanban, roles: ['manager'] },
  { label: 'Tasks', path: '/manager/tasks', icon: ClipboardList, roles: ['manager'] },
  { label: 'Attendance', path: '/manager/attendance', icon: Clock, roles: ['manager'] },
  { label: 'Reports', path: '/manager/reports', icon: FileText, roles: ['manager'] },
  { label: 'Leave Requests', path: '/manager/leave', icon: Calendar, roles: ['manager'] },
  
  // Worker items
  { label: 'Dashboard', path: '/worker', icon: LayoutDashboard, roles: ['worker'] },
  { label: 'Check In/Out', path: '/worker/attendance', icon: MapPin, roles: ['worker'] },
  { label: 'My Tasks', path: '/worker/tasks', icon: ClipboardList, roles: ['worker'] },
  { label: 'Submit Report', path: '/worker/report', icon: Send, roles: ['worker'] },
  { label: 'Apply Leave', path: '/worker/leave', icon: Calendar, roles: ['worker'] },
  { label: 'My History', path: '/worker/history', icon: Clock, roles: ['worker'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <Leaf className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg text-sidebar-foreground">
            EcoOps
          </span>
          <span className="text-xs text-sidebar-foreground/60 capitalize">
            {user.role} Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-primary text-primary-foreground shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
