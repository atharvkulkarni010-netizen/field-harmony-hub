import React, { useState, useEffect } from 'react';
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
import api from '@/services/api';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    workers: 0,
    activeWorkers: 0,
    tasksDue: 0,
    pendingRequests: 0
  });
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasksDue, setTasksDue] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch specific data
        const [
          managerStatsRes,
          projectsRes,
          attendanceRes,
          reportsRes,
          leavesRes,
          tasksDueRes
        ] = await Promise.all([
          api.get('/analytics/manager-stats'),
          api.get('/projects'),
          api.get('/attendance/manager/team-attendance'),
          api.get('/daily-reports/manager/recent-reports'),
          api.get('/leaves/manager/team-leaves'),
          api.get('/tasks/due-today')
        ]);

        // Process data
        const managerStats = managerStatsRes.data[0] || {};
        const teamAttendance = attendanceRes.data || [];
        const activeWorkers = teamAttendance.filter((a: any) => a.status === 'PRESENT').length;
        const pendingLeaves = (leavesRes.data || []).filter((l: any) => l.status === 'PENDING');
        const tasks = tasksDueRes.data || [];
        
        // Update state
        setProjects(projectsRes.data || []);
        setAttendance(teamAttendance.slice(0, 5)); // Show top 5
        setRecentReports((reportsRes.data || []).slice(0, 5));
        setLeaves(pendingLeaves.slice(0, 5));
        setTasksDue(tasks);
        
        setStats({
          projects: managerStats.projects || 0,
          workers: managerStats.workers || 0,
          activeWorkers,
          tasksDue: tasks.length,
          pendingRequests: pendingLeaves.length
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Project progress calculation
  const getProjectProgress = (project: any) => {
    if (!project.total_tasks || project.total_tasks === 0) return 0;
    return Math.round((project.completed_tasks / project.total_tasks) * 100);
  };

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
          value={stats.projects}
          icon={FolderKanban}
          variant="primary"
        />
        <StatCard
          title="Team Members"
          value={stats.workers}
          subtitle={`${stats.activeWorkers} in field today`}
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Tasks Due Today"
          value={stats.tasksDue}
          subtitle="Urgent attention"
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
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
            {projects.slice(0, 3).map((project: any) => (
              <div key={project.project_id} className="p-4 rounded-xl bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge className={project.status === 'Ongoing' ? 'status-active' : 'status-pending'}>
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-medium text-xs">
                       {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                    <Progress value={getProjectProgress(project)} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground mt-1">{getProjectProgress(project)}% Complete</p>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No active projects</div>
            )}
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
            {attendance.map((record: any) => (
              <div
                key={record.attendance_id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-medium">
                  {record.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{record.name || 'Unknown'}</p>
                  {record.status === 'PRESENT' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {record.check_in_time}
                    </p>
                  )}
                </div>
                <Badge
                  className={
                    record.status === 'PRESENT'
                      ? 'status-active'
                      : record.status === 'LEAVE'
                      ? 'bg-muted text-muted-foreground'
                      : 'status-pending'
                  }
                >
                  {record.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {record.status}
                </Badge>
              </div>
            ))}
            {attendance.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No attendance records today</div>
            )}
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
            {recentReports.map((report: any) => (
              <div
                key={report.report_id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{report.worker_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.task_title || 'General Report'} • {new Date(report.report_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Received
                </Badge>
              </div>
            ))}
            {recentReports.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No recent reports</div>
            )}
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card className="nature-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Calendar className="w-5 h-5 text-primary" />
              Pending Leave Requests
            </CardTitle>
            <Link to="/manager/leave">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaves.map((leave: any) => (
              <div
                key={leave.leave_id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium">{leave.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.reason} • {new Date(leave.start_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    Pending
                </Badge>
              </div>
            ))}
             {leaves.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No pending leave requests</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert */}
      {tasksDue.length > 0 && (
      <Card className="nature-card border-sun/30 bg-sun/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sun mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Tasks Due Today</p>
              <p className="text-sm text-muted-foreground">
                {tasksDue.length} tasks are due today across your projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
