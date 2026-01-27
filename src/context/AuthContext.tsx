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

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@ngo.org': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@ngo.org',
      name: 'Sarah Green',
      role: 'admin',
    },
  },
  'manager@ngo.org': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'manager@ngo.org',
      name: 'John Forest',
      role: 'manager',
    },
  },
  'worker@ngo.org': {
    password: 'worker123',
    user: {
      id: '3',
      email: 'worker@ngo.org',
      name: 'Maria Rivers',
      role: 'worker',
      managerId: '2',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = sessionStorage.getItem('auth_token');
    const storedUser = sessionStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

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
    
    setUser(demoUser.user);
    setToken(mockToken);
    sessionStorage.setItem('auth_token', mockToken);
    sessionStorage.setItem('auth_user', JSON.stringify(demoUser.user));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
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
