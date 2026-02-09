import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  ClipboardList,
  Clock,
  FileText,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { attendanceApi, taskAssignmentsApi, reportsApi, leaveApi } from '@/services/api';
import { format } from 'date-fns';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // State for dashboard data
  const [attendance, setAttendance] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState({ total: 20, used: 0, pending: 0 }); // Hardcoded total for now
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Today's Attendance
        try {
          const attendanceRes = await attendanceApi.getToday();
          setAttendance(attendanceRes.data);
        } catch (err) {
          // Ignore 404 or null, means not checked in
          setAttendance(null);
        }

        // 2. Fetch Tasks
        const tasksRes = await taskAssignmentsApi.getMyAssignments();
        setTasks(tasksRes.data);

        // 3. Fetch Reports (for recent activity)
        if (user?.user_id) {
           const reportsRes = await reportsApi.getByWorker(user.user_id);
           setReports(reportsRes.data);
           
           // 4. Fetch Leaves (for balance)
           const leavesRes = await leaveApi.getHistory(user.user_id);
           const leaves = leavesRes.data;
           const used = leaves.filter((l: any) => l.status === 'APPROVED').length; // Simplified: 1 leave request = 1 day used (refined logic needed for range)
           const pending = leaves.filter((l: any) => l.status === 'PENDING').length;
           
           // Calculate days used properly
           let daysUsed = 0;
           leaves.filter((l: any) => l.status === 'APPROVED').forEach((l: any) => {
               const start = new Date(l.start_date);
               const end = new Date(l.end_date);
               const diffTime = Math.abs(end.getTime() - start.getTime());
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
               daysUsed += diffDays;
           });

           setLeaveBalance(prev => ({ ...prev, used: daysUsed, pending }));
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Derived Values
  const isCheckedIn = !!attendance && !attendance.check_out_time;
  const checkInTime = attendance ? new Date(`1970-01-01T${attendance.check_in_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  
  // Calculate hours worked if checked in
  let hoursWorked = 0;
  if (isCheckedIn && attendance) {
      const start = new Date(`1970-01-01T${attendance.check_in_time}`);
      const now = new Date();
      // Adjust now to be on 1970-01-01 for comparison or just use time diff
      const current = new Date(`1970-01-01T${now.toLocaleTimeString('en-US', { hour12: false })}`);
      hoursWorked = Math.max(0, (current.getTime() - start.getTime()) / (1000 * 60 * 60));
  } else if (attendance && attendance.check_out_time) {
      const start = new Date(`1970-01-01T${attendance.check_in_time}`);
      const end = new Date(`1970-01-01T${attendance.check_out_time}`);
      hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  const activeTasksCount = tasks.filter(t => t.status === 'Ongoing').length;
  const reportsThisWeek = reports.filter(r => {
      const reportDate = new Date(r.report_date);
      const now = new Date();
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return reportDate >= oneWeekAgo;
  }).length;

  // Priority Task: Find earliest due date that is not completed
  const priorityTask = tasks
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  if (loading) {
      return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}!`}
        description="Here's your work summary for today"
      />

      {/* Today's Status */}
      <Card className={`nature-card ${isCheckedIn ? 'border-secondary/30 bg-secondary/5' : 'border-sun/30 bg-sun/5'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCheckedIn ? 'bg-secondary/20' : 'bg-sun/20'}`}>
                <MapPin className={`w-7 h-7 ${isCheckedIn ? 'text-secondary' : 'text-sun'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {isCheckedIn ? 'Currently Working' : 'Not Checked In'}
                  </h3>
                  <Badge className={isCheckedIn ? 'status-active' : 'status-pending'}>
                    {isCheckedIn ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {isCheckedIn && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Checked in at {checkInTime}
                  </p>
                )}
                 {!isCheckedIn && attendance?.check_out_time && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Checked out at {new Date(`1970-01-01T${attendance.check_out_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
            <Link to="/worker/attendance">
              <Button className={isCheckedIn ? 'gradient-earth' : 'gradient-forest'} size="lg">
                {isCheckedIn ? 'Check Out' : 'Check In'}
                <MapPin className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Hours"
          value={`${hoursWorked.toFixed(1)}h`}
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="My Tasks"
          value={tasks.length}
          subtitle={`${activeTasksCount} in progress`}
          icon={ClipboardList}
          variant="secondary"
        />
        <StatCard
          title="Reports This Week"
          value={reportsThisWeek}
          icon={FileText}
        />
        <StatCard
          title="Leave Balance"
          value={Math.max(0, leaveBalance.total - leaveBalance.used)}
          subtitle={`${leaveBalance.pending} pending requests`}
          icon={Calendar}
          variant="accent"
        />
      </div>

      {/* Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <Card className="nature-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <ClipboardList className="w-5 h-5 text-primary" />
              My Tasks
            </CardTitle>
            <Link to="/worker/tasks">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.assignment_id || task.task_id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => window.location.href='/worker/tasks'} // Simple nav for now
                style={{cursor: 'pointer'}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' // Backend doesn't have priority yet, default handling
                        ? 'bg-destructive'
                        : 'bg-sun'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.project_name} • Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    task.status === 'Ongoing'
                      ? 'bg-sky/20 text-sky border-sky/30'
                      : 'status-pending'
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center text-muted-foreground py-4">No tasks assigned.</p>}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="nature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Send className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/worker/report" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  <FileText className="w-4 h-4 mr-3" />
                  Submit Daily Report
                </Button>
              </Link>
              <Link to="/worker/leave" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  <Calendar className="w-4 h-4 mr-3" />
                  Apply for Leave
                </Button>
              </Link>
              <Link to="/worker/attendance" className="block">
                 {/* Replaced history with attendance since history page might not exist yet or be same */}
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  <Clock className="w-4 h-4 mr-3" />
                  View Attendance
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="nature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <FileText className="w-5 h-5 text-primary" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.slice(0, 3).map((report) => (
                <div
                  key={report.report_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium truncate w-32">{report.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.report_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="status-completed">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Submitted
                  </Badge>
                </div>
              ))}
               {reports.length === 0 && <p className="text-center text-muted-foreground text-sm py-2">No reports yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert / Priority Task */}
      {priorityTask && (
        <Card className="nature-card border-primary/30 bg-primary/5">
            <CardContent className="p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                <p className="font-medium text-foreground">Priority Task Due {new Date(priorityTask.due_date) < new Date() ? 'Soon' : 'Today'}</p>
                <p className="text-sm text-muted-foreground">
                    "{priorityTask.title}" in {priorityTask.project_name} is due {new Date(priorityTask.due_date).toLocaleDateString()}. Status: {priorityTask.status}.
                </p>
                </div>
            </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
