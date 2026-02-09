import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/context/AuthContext';

interface AdminProtectedWrapperProps {
  children: React.ReactNode;
}

export default function AdminProtectedWrapper({ children }: AdminProtectedWrapperProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not admin, redirect to appropriate dashboard
  if (user.role !== 'admin') {
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      manager: '/manager',
      worker: '/worker',
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  // User is authenticated and is admin - render children
  return <>{children}</>;
}