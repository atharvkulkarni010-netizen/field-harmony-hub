import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  FolderKanban,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
  Leaf,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total_managers: 0,
    total_workers: 0,
    active_projects: 0,
    tasks_completed_this_month: 0
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, attendanceRes, projectsRes, activityRes] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getAttendanceTrends(),
          analyticsApi.getProjectStatus(),
          analyticsApi.getRecentActivity()
        ]);

        setStats(statsRes.data);
        setAttendanceData(attendanceRes.data);
        setProjectStatusData(projectsRes.data);
        
        // Map icons to activities
        const mappedActivities = activityRes.data.map((activity: any, index: number) => ({
          ...activity,
          id: index,
          icon: getActivityIcon(activity.type)
        }));
        setRecentActivities(mappedActivities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return FolderKanban;
      case 'task': return ClipboardCheck;
      case 'attendance': return MapPin;
      case 'leave': return Calendar;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.name?.split(' ')[0]}!`}
        description="Here's an overview of your field operations"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Managers"
          value={stats.total_managers}
          subtitle="Registered managers"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Workers"
          value={stats.total_workers}
          subtitle="Registered workers"
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Active Projects"
          value={stats.active_projects}
          subtitle="Ongoing projects"
          icon={FolderKanban}
          variant="accent"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.tasks_completed_this_month}
          subtitle="this month"
          icon={ClipboardCheck}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(122, 47%, 33%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(122, 47%, 33%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(122, 15%, 40%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(122, 15%, 40%)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(122, 20%, 85%)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px -4px hsl(122, 30%, 15%, 0.1)',
                    }}
                    formatter={(value: number) => [`${value}`, 'Attendance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="hsl(122, 47%, 33%)"
                    strokeWidth={3}
                    fill="url(#attendanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Activity className="w-5 h-5 text-primary" />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(122, 20%, 85%)',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {projectStatusData.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="nature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Leaf className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity: any, index: number) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(activity.time).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
