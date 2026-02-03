import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'worker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  managerId?: string;
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

// Demo users for testing (matching seeded database)
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@ngo.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@ngo.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
  'john.manager@ngo.com': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'john.manager@ngo.com',
      name: 'John Manager',
      role: 'manager',
    },
  },
  'worker1@ngo.com': {
    password: 'worker123',
    user: {
      id: '3',
      email: 'worker1@ngo.com',
      name: 'Worker One',
      role: 'worker',
      managerId: '2',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLogout, setShouldLogout] = useState(false);

  // Effect to load auth data on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
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
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoUser = DEMO_USERS[email.toLowerCase()];
    
    if (!demoUser || demoUser.password !== password) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }
    
    // Generate mock JWT
    const mockToken = `jwt_${demoUser.user.role}_${Date.now()}`;
    
    // Setting state will trigger the storage sync effect
    setUser(demoUser.user);
    setToken(mockToken);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      // Only call backend if we had a token
      const currentToken = token || sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (currentToken) {
        // Call backend logout endpoint
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/logout`, {
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
