import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth, UserRole } from '@/context/AuthContext';

interface DashboardLayoutProps {
  allowedRoles: UserRole[];
}

export function DashboardLayout({ allowedRoles }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background leaf-pattern">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      manager: '/manager',
      worker: '/worker',
    };
    return <Navigate to={roleRedirects[user?.role || 'worker']} replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background leaf-pattern">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:pl-0 pl-0">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
