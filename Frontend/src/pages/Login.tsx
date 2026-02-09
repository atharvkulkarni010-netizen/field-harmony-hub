import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Eye, EyeOff, Mail, Lock, TreeDeciduous, Mountain, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password Reset State
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  
  // Forgot Password Dialog
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Login function that calls the backend
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Temporarily set the token to allow the authenticated request
      if (tempToken) {
        sessionStorage.setItem('auth_token', tempToken);
      }

      await authApi.updatePassword(newPassword);

      toast({
        title: "Password updated",
        description: "Your password has been changed correctly. Proceeding to login...",
      });
      
      setShowResetDialog(false);
      
      // Proceed with normal login flow now that password is updated
      // We can just reuse the handling logic from handleSubmit effectively
      // But we need to refresh the user state/token potentially or just proceed if the token is valid.
      // Easiest is to auto-navigate based on the role we already received.
      
      // Re-fetch user details or just use what we had?
      // The backend token is valid. We just updated the flag in DB.
      // We can proceed.
      const userDataStr = sessionStorage.getItem('auth_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.force_password_reset = false; // Update local state
        sessionStorage.setItem('auth_user', JSON.stringify(userData));
        
        // Use newPassword because the password has just been changed in the DB
        await login(email, newPassword); // Update context

        const roleRedirects: Record<UserRole, string> = {
          admin: '/admin',
          manager: '/manager',
          worker: '/worker',
        };
        navigate(roleRedirects[userData.role as UserRole]);
      }

    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error updating password',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
      sessionStorage.removeItem('auth_token'); // Clear temp token on failure
    } finally {
      setIsLoading(false);
    }
  };

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
      
      if (loginResponse.resetRequired) {
        setTempToken(loginResponse.token);
        setShowResetDialog(true);
        setIsLoading(false);
        return;
      }
      
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
      if (!showResetDialog) setIsLoading(false);
    }
  };

  // Demo login function (can be kept as is or modified to call backend demo endpoints)


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
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 h-auto text-sm text-primary hover:text-primary/80"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>
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

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password Required</DialogTitle>
            <DialogDescription>
              For security reasons, you must change your password before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordReset} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
}

function ForgotPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast({ title: 'OTP Sent', description: 'Please check your email for the OTP.' });
      setStep('otp');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      toast({ title: 'Success', description: 'Password reset successfully. Please login.' });
      onOpenChange(false);
      setStep('email');
      setEmail('');
      setOtp('');
      setNewPassword('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset password. Invalid OTP or expired.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            {step === 'email' 
              ? "Enter your email address to receive a One-Time Password (OTP)." 
              : "Enter the OTP sent to your email and your new password."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {step === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <div className="flex gap-2 justify-center">
                   <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">New Password</Label>
                 <Input
                  id="reset-new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {step === 'email' ? (
            <Button onClick={handleSendOTP} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          ) : (
             <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
