import React from 'react';
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

// Demo data
const attendanceData = [
  { day: 'Mon', attendance: 85 },
  { day: 'Tue', attendance: 92 },
  { day: 'Wed', attendance: 88 },
  { day: 'Thu', attendance: 95 },
  { day: 'Fri', attendance: 90 },
  { day: 'Sat', attendance: 45 },
  { day: 'Sun', attendance: 30 },
];

const projectStatusData = [
  { name: 'Active', value: 12, color: 'hsl(122, 47%, 33%)' },
  { name: 'Completed', value: 8, color: 'hsl(122, 43%, 57%)' },
  { name: 'On Hold', value: 3, color: 'hsl(45, 93%, 58%)' },
  { name: 'Planning', value: 5, color: 'hsl(16, 16%, 47%)' },
];

const recentActivities = [
  { id: 1, action: 'New project created', user: 'Sarah Green', time: '2 hours ago', icon: FolderKanban },
  { id: 2, action: 'Worker checked in', user: 'Maria Rivers', time: '3 hours ago', icon: MapPin },
  { id: 3, action: 'Task completed', user: 'John Forest', time: '5 hours ago', icon: ClipboardCheck },
  { id: 4, action: 'Leave approved', user: 'Admin', time: '1 day ago', icon: Calendar },
];

export default function AdminDashboard() {
  const { user } = useAuth();

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
          value={12}
          subtitle="from last month"
          trend={{ value: 8, isPositive: true }}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Workers"
          value={156}
          subtitle="from last month"
          trend={{ value: 12, isPositive: true }}
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Active Projects"
          value={28}
          subtitle="3 completed this week"
          icon={FolderKanban}
          variant="accent"
        />
        <StatCard
          title="Tasks Completed"
          value={342}
          subtitle="this month"
          trend={{ value: 15, isPositive: true }}
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
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(122, 20%, 85%)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px -4px hsl(122, 30%, 15%, 0.1)',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
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
                      {projectStatusData.map((entry, index) => (
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
                {projectStatusData.map((item) => (
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
            {recentActivities.map((activity, index) => (
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
                  {activity.time}
                </span>
              </div>
            ))}
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
