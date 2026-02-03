import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Eye, EyeOff, Mail, Lock, TreeDeciduous, Mountain, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Backend API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Login function that calls the backend
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      // Re-throw the original error to preserve axios error information
      throw error;
    }
  };

  // Create axios instance with request interceptor to add auth token
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to automatically include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Updated handleSubmit to use backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call backend API
      const loginResponse = await handleLogin(email, password);
      
      // Store user data and token
      sessionStorage.setItem('auth_token', loginResponse.token);
      // Convert role to lowercase to match frontend UserRole type
      const userData = {
        ...loginResponse.user,
        role: loginResponse.user.role.toLowerCase()
      };
      sessionStorage.setItem('auth_user', JSON.stringify(userData));
      
      // Update auth context
      await login(email, password);
      
      // Get user role and redirect
      const roleRedirects: Record<UserRole, string> = {
        admin: '/admin',
        manager: '/manager',
        worker: '/worker',
      };
      
      navigate(roleRedirects[userData.role as UserRole]);
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${loginResponse.user.name}`,
      });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.message || `Login failed: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'Network error: Unable to reach server. Please check your connection.';
        } else {
          // Something else happened
          errorMessage = 'Login request failed. Please try again.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login function (can be kept as is or modified to call backend demo endpoints)
  const demoLogin = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; password: string }> = {
      admin: { email: 'admin@ngo.com', password: 'admin123' },
      manager: { email: 'john.manager@ngo.com', password: 'manager123' },
      worker: { email: 'worker1@ngo.com', password: 'worker123' },
    };
    
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-forest shadow-glow mb-4">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              EcoOps
            </h1>
            <p className="mt-2 text-muted-foreground">
              Field Operations Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-forest text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo logins */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  Quick demo access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-auto py-3 flex flex-col items-center gap-1 hover:bg-primary/5 hover:border-primary/30"
                onClick={() => demoLogin('admin')}
              >
                <span className="text-xs font-medium text-primary">Admin</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-auto py-3 flex flex-col items-center gap-1 hover:bg-secondary/10 hover:border-secondary/30"
                onClick={() => demoLogin('manager')}
              >
                <span className="text-xs font-medium text-secondary">Manager</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-auto py-3 flex flex-col items-center gap-1 hover:bg-accent/10 hover:border-accent/30"
                onClick={() => demoLogin('worker')}
              >
                <span className="text-xs font-medium text-accent">Worker</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 gradient-forest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="flex gap-6 mb-8">
            <TreeDeciduous className="w-16 h-16 text-primary-foreground/80 float-animation" style={{ animationDelay: '0s' }} />
            <Mountain className="w-20 h-20 text-primary-foreground/90 float-animation" style={{ animationDelay: '0.5s' }} />
            <Waves className="w-16 h-16 text-primary-foreground/80 float-animation" style={{ animationDelay: '1s' }} />
          </div>
          
          <h2 className="text-4xl font-bold font-display text-primary-foreground mb-4">
            Protecting Our Planet
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            Empowering field teams to make a difference. Track operations, manage projects, and protect the environment together.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-primary-foreground">
            <div className="text-center">
              <p className="text-3xl font-bold">150+</p>
              <p className="text-sm text-primary-foreground/70">Active Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-primary-foreground/70">Field Workers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">25k</p>
              <p className="text-sm text-primary-foreground/70">Acres Protected</p>
            </div>
          </div>
        </div>

        {/* Leaf pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-5 10-15 15-25 15 5-10 15-15 25-15zm0 0c5 10 15 15 25 15-5-10-15-15-25-15z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
        }} />
      </div>
    </div>
  );
}
