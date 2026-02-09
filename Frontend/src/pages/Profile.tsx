import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Briefcase, User, Calendar, Shield, Users } from 'lucide-react';
import { usersApi } from '@/services/api';
import { format } from 'date-fns';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Manage your account settings" />
        <Card className="nature-card">
           <CardContent className="p-6">
             <div className="flex items-center gap-4">
               <Skeleton className="h-20 w-20 rounded-full" />
               <div className="space-y-2">
                 <Skeleton className="h-4 w-[200px]" />
                 <Skeleton className="h-4 w-[150px]" />
               </div>
             </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View your personal information and account details"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Profile Card */}
        <Card className="nature-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl font-bold text-foreground">{profile.name}</h3>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="pt-2">
                   <Badge variant="outline" className="capitalize bg-secondary/10 text-secondary border-secondary/20">
                     {profile.role.toLowerCase()}
                   </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-primary" />
                  {profile.role}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <div className="flex items-center gap-2 font-medium">
                   <Calendar className="w-4 h-4 text-primary" />
                   {profile.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'N/A'}
                </div>
              </div>
              
              {profile.role === 'WORKER' && profile.manager && (
                <div className="space-y-1 sm:col-span-2">
                   <label className="text-sm font-medium text-muted-foreground">Reporting To</label>
                   <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{profile.manager.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile.manager.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.manager.email}</p>
                      </div>
                   </div>
                </div>
              )}
              
               {profile.role === 'MANAGER' && (
                <div className="space-y-1">
                   <label className="text-sm font-medium text-muted-foreground">Team Size</label>
                   <div className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      {profile.workersCount || 0} Workers
                   </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Security (Placeholder for now) */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm text-muted-foreground">
               Password last changed: Never
             </div>
             {/* Future: Add Change Password Button here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
