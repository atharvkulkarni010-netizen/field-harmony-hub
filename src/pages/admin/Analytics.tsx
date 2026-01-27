import React from 'react';
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

// Demo analytics data
const monthlyAttendance = [
  { month: 'Jan', attendance: 88, target: 90 },
  { month: 'Feb', attendance: 92, target: 90 },
  { month: 'Mar', attendance: 85, target: 90 },
  { month: 'Apr', attendance: 90, target: 90 },
  { month: 'May', attendance: 94, target: 90 },
  { month: 'Jun', attendance: 91, target: 90 },
];

const tasksByProject = [
  { project: 'River Cleanup', completed: 15, pending: 9 },
  { project: 'Forest Restoration', completed: 12, pending: 18 },
  { project: 'Trail Conservation', completed: 2, pending: 16 },
  { project: 'Wildlife Survey', completed: 8, pending: 4 },
];

const weeklyProgress = [
  { week: 'Week 1', tasks: 12, hours: 320 },
  { week: 'Week 2', tasks: 18, hours: 420 },
  { week: 'Week 3', tasks: 15, hours: 380 },
  { week: 'Week 4', tasks: 22, hours: 480 },
];

const regionData = [
  { region: 'Northern', workers: 45, projects: 8 },
  { region: 'Coastal', workers: 32, projects: 5 },
  { region: 'Mountain', workers: 28, projects: 6 },
  { region: 'Eastern', workers: 51, projects: 9 },
];

export default function Analytics() {
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
          value="91%"
          trend={{ value: 3, isPositive: true }}
          subtitle="vs last month"
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="Tasks This Month"
          value={67}
          trend={{ value: 12, isPositive: true }}
          subtitle="vs last month"
          icon={ClipboardCheck}
          variant="secondary"
        />
        <StatCard
          title="Active Workers"
          value={142}
          trend={{ value: 5, isPositive: true }}
          subtitle="currently in field"
          icon={Users}
        />
        <StatCard
          title="Projects on Track"
          value="85%"
          trend={{ value: 2, isPositive: false }}
          subtitle="meeting deadlines"
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
              Attendance Trends
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
                    domain={[80, 100]}
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
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(122, 43%, 57%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
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
        {/* Weekly Progress */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Weekly Progress
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

        {/* Region Overview */}
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <MapPin className="w-5 h-5 text-primary" />
              Region Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{region.region} Region</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {region.workers} workers
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {region.projects} projects
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {Math.round((region.workers / 156) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">of workforce</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="nature-card border-sun/30 bg-sun/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sun mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Attention Required</p>
              <p className="text-sm text-muted-foreground">
                3 projects are behind schedule. 5 workers have pending leave requests. Review recommended.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
