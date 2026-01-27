import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import {
  FolderKanban,
  ClipboardList,
  Users,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Demo data
const assignedProjects = [
  { id: '1', name: 'River Cleanup Initiative', progress: 65, tasks: 24, workers: 8, status: 'active' },
  { id: '2', name: 'Wetland Survey', progress: 30, tasks: 12, workers: 4, status: 'active' },
];

const recentReports = [
  { id: '1', worker: 'Maria Rivers', task: 'Water sampling', time: '2 hours ago', status: 'pending' },
  { id: '2', worker: 'Carlos Leaf', task: 'Trail marking', time: '4 hours ago', status: 'approved' },
  { id: '3', worker: 'Aisha Green', task: 'Species count', time: '5 hours ago', status: 'pending' },
];

const pendingLeave = [
  { id: '1', worker: 'Luna Park', type: 'Sick Leave', dates: 'Mar 15 - Mar 16', days: 2 },
  { id: '2', worker: 'David Stone', type: 'Personal', dates: 'Mar 20', days: 1 },
];

const workerAttendance = [
  { id: '1', name: 'Maria Rivers', status: 'checked-in', location: 'River Basin North', time: '08:15 AM' },
  { id: '2', name: 'Carlos Leaf', status: 'checked-in', location: 'Forest Trail A', time: '08:30 AM' },
  { id: '3', name: 'Aisha Green', status: 'checked-out', location: '-', time: '-' },
  { id: '4', name: 'Luna Park', status: 'on-leave', location: '-', time: '-' },
];

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}!`}
        description="Manage your team and track project progress"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Projects"
          value={2}
          icon={FolderKanban}
          variant="primary"
        />
        <StatCard
          title="Team Members"
          value={12}
          subtitle="8 in field today"
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Open Tasks"
          value={18}
          subtitle="5 due today"
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Requests"
          value={3}
          subtitle="Leave & reports"
          icon={Calendar}
          variant="accent"
        />
      </div>

      {/* Projects & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="nature-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <FolderKanban className="w-5 h-5 text-primary" />
              My Projects
            </CardTitle>
            <Link to="/manager/projects">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignedProjects.map((project) => (
              <div key={project.id} className="p-4 rounded-xl bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge className="status-active">Active</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4" />
                    {project.tasks} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.workers} workers
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Attendance */}
        <Card className="nature-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Clock className="w-5 h-5 text-primary" />
              Team Today
            </CardTitle>
            <Link to="/manager/attendance">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {workerAttendance.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-medium">
                  {worker.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{worker.name}</p>
                  {worker.status === 'checked-in' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {worker.location}
                    </p>
                  )}
                </div>
                <Badge
                  className={
                    worker.status === 'checked-in'
                      ? 'status-active'
                      : worker.status === 'on-leave'
                      ? 'bg-muted text-muted-foreground'
                      : 'status-pending'
                  }
                >
                  {worker.status === 'checked-in' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {worker.status.replace('-', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reports & Leave */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card className="nature-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <FileText className="w-5 h-5 text-primary" />
              Recent Reports
            </CardTitle>
            <Link to="/manager/reports">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{report.worker}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.task} • {report.time}
                  </p>
                </div>
                <Badge
                  className={report.status === 'pending' ? 'status-pending' : 'status-completed'}
                >
                  {report.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card className="nature-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Calendar className="w-5 h-5 text-primary" />
              Leave Requests
            </CardTitle>
            <Link to="/manager/leave">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLeave.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{leave.worker}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.type} • {leave.dates}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs">
                    Reject
                  </Button>
                  <Button size="sm" className="h-7 rounded-lg text-xs gradient-forest text-primary-foreground">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alert */}
      <Card className="nature-card border-sun/30 bg-sun/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sun mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Tasks Due Today</p>
              <p className="text-sm text-muted-foreground">
                5 tasks are due today. 2 workers have not submitted their daily reports yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
