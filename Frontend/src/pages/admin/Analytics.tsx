import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FolderKanban,
  ClipboardCheck,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { analyticsApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export default function Analytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    avg_attendance: 0,
    tasks_this_month: 0,
    active_workers: 0,
    projects_on_track: 0
  });

  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [tasksByProject, setTasksByProject] = useState([]);
  const [managerStats, setManagerStats] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]); // Now state-driven

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [metricsRes, attendanceRes, tasksRes, managerRes, weeklyRes] = await Promise.all([
          analyticsApi.getKeyMetrics(),
          analyticsApi.getMonthlyAttendance(),
          analyticsApi.getTasksByProject(),
          analyticsApi.getManagerStats(),
          analyticsApi.getWeeklyProgress()
        ]);

        setMetrics(metricsRes.data);
        setMonthlyAttendance(attendanceRes.data);
        setTasksByProject(tasksRes.data);
        setManagerStats(managerRes.data);
        setWeeklyProgress(weeklyRes.data);

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Overview of field operations performance"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg. Attendance"
          value={metrics.avg_attendance}
          trend={{ value: 0, isPositive: true }} // Trend not calculated
          subtitle="today"
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="Tasks This Month"
          value={metrics.tasks_this_month}
          subtitle="total tasks"
          icon={ClipboardCheck}
          variant="secondary"
        />
        <StatCard
          title="Active Workers"
          value={metrics.active_workers}
          subtitle="checked in today"
          icon={Users}
        />
        <StatCard
          title="Projects on Track"
          value={metrics.projects_on_track}
          subtitle="ongoing projects"
          icon={FolderKanban}
          variant="accent"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <TrendingUp className="w-5 h-5 text-primary" />
              Attendance Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAttendance}>
                  <XAxis
                    dataKey="month"
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
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="hsl(122, 47%, 33%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(122, 47%, 33%)', strokeWidth: 2 }}
                    name="Actual %"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(122, 43%, 57%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Project */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Tasks by Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByProject} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(122, 15%, 40%)', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="project"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(122, 15%, 40%)', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(122, 20%, 85%)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="hsl(122, 47%, 33%)"
                    radius={[0, 4, 4, 0]}
                    name="Completed"
                  />
                  <Bar
                    dataKey="pending"
                    stackId="a"
                    fill="hsl(122, 43%, 57%)"
                    radius={[0, 4, 4, 0]}
                    name="Pending"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress - Keeping static for now */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Weekly Progress (Demo Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(122, 47%, 33%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(122, 47%, 33%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="week"
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
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="hsl(122, 47%, 33%)"
                    strokeWidth={3}
                    fill="url(#tasksGradient)"
                    name="Tasks Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Manager Overview (Replaced Region Overview) */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Users className="w-5 h-5 text-primary" />
              Manager Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {managerStats.map((manager: any, index: number) => (
                <div
                  key={manager.manager}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{manager.manager}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {manager.workers} workers
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {manager.projects} projects
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {manager.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">of workforce</p>
                  </div>
                </div>
              ))}
              {managerStats.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No managers found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts - Keeping static or could be dynamic later */}
      <Card className="nature-card border-sun/30 bg-sun/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sun mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Attention Required</p>
              <p className="text-sm text-muted-foreground">
                 System alerts will appear here. (Currently static)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
