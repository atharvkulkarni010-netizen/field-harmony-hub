import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export type UserRole = 'admin' | 'manager' | 'worker';

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  manager_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);

  // Effect to load auth data on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('token');
    const storedUser = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Effect to sync user state to storage
  useEffect(() => {
    if (user && token) {
      // Store in both sessionStorage and localStorage for persistence
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      // Also store with original keys for compatibility
      sessionStorage.setItem('token', token);
      localStorage.setItem('token', token);
    }
  }, [user, token]);

  // Effect to handle logout cleanup
  useEffect(() => {
    if (shouldLogout) {
      // Clear all storage locations
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Reset logout flag
      setShouldLogout(false);
      
      // Redirect after cleanup
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, [shouldLogout]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { token, user } = response.data;
      
      // Convert role to lowercase to match frontend UserRole type
      const userData = {
        ...user,
        role: user.role.toLowerCase() as UserRole
      };
      
      // Setting state will trigger the storage sync effect
      setUser(userData);
      setToken(token);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Only call backend if we had a token
      const currentToken = token || sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (currentToken) {
        // Call backend logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error (continuing with local logout):', error);
      // Continue with local logout even if API call fails
    } finally {
      // Trigger logout cleanup effect
      setShouldLogout(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
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
