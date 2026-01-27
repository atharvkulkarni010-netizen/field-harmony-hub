import React from 'react';
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

// Demo data
const todayStatus = {
  isCheckedIn: true,
  checkInTime: '08:30 AM',
  location: 'River Basin North',
  hoursWorked: 4.5,
};

const assignedTasks = [
  { id: '1', title: 'Water Quality Testing', project: 'River Cleanup', priority: 'high', dueDate: '2024-03-15', status: 'in-progress' },
  { id: '2', title: 'Sample Collection', project: 'River Cleanup', priority: 'medium', dueDate: '2024-03-16', status: 'pending' },
  { id: '3', title: 'Equipment Check', project: 'River Cleanup', priority: 'low', dueDate: '2024-03-17', status: 'pending' },
];

const recentReports = [
  { id: '1', date: '2024-03-13', task: 'Trail Marking', status: 'approved' },
  { id: '2', date: '2024-03-12', task: 'Species Count', status: 'approved' },
  { id: '3', date: '2024-03-11', task: 'Water Testing', status: 'approved' },
];

const leaveBalance = {
  total: 20,
  used: 5,
  pending: 2,
};

export default function WorkerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}!`}
        description="Here's your work summary for today"
      />

      {/* Today's Status */}
      <Card className={`nature-card ${todayStatus.isCheckedIn ? 'border-secondary/30 bg-secondary/5' : 'border-sun/30 bg-sun/5'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${todayStatus.isCheckedIn ? 'bg-secondary/20' : 'bg-sun/20'}`}>
                <MapPin className={`w-7 h-7 ${todayStatus.isCheckedIn ? 'text-secondary' : 'text-sun'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {todayStatus.isCheckedIn ? 'Currently Working' : 'Not Checked In'}
                  </h3>
                  <Badge className={todayStatus.isCheckedIn ? 'status-active' : 'status-pending'}>
                    {todayStatus.isCheckedIn ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {todayStatus.isCheckedIn && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Checked in at {todayStatus.checkInTime} • {todayStatus.location}
                  </p>
                )}
              </div>
            </div>
            <Link to="/worker/attendance">
              <Button className={todayStatus.isCheckedIn ? 'gradient-earth' : 'gradient-forest'} size="lg">
                {todayStatus.isCheckedIn ? 'Check Out' : 'Check In'}
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
          value={`${todayStatus.hoursWorked}h`}
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="My Tasks"
          value={assignedTasks.length}
          subtitle="1 in progress"
          icon={ClipboardList}
          variant="secondary"
        />
        <StatCard
          title="Reports This Week"
          value={recentReports.length}
          icon={FileText}
        />
        <StatCard
          title="Leave Balance"
          value={leaveBalance.total - leaveBalance.used}
          subtitle={`${leaveBalance.pending} pending`}
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
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-destructive'
                        : task.priority === 'medium'
                        ? 'bg-sun'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.project} • Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    task.status === 'in-progress'
                      ? 'bg-sky/20 text-sky border-sky/30'
                      : 'status-pending'
                  }
                >
                  {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </Badge>
              </div>
            ))}
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
              <Link to="/worker/history" className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                  <Clock className="w-4 h-4 mr-3" />
                  View History
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
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium">{report.task}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="status-completed">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {report.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert */}
      <Card className="nature-card border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Today's Priority Task</p>
              <p className="text-sm text-muted-foreground">
                Water Quality Testing at River Basin is due today. Make sure to complete sample collection before 4 PM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
