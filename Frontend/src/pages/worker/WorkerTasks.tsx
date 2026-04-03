import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Calendar, MapPin, CheckCircle2, Clock, Play, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { taskAssignmentsApi, tasksApi } from '@/services/api';

interface Task {
  task_id: number;
  title: string;
  description: string;
  project_name: string;
  due_date: string;
  status: 'Yet to start' | 'Ongoing' | 'In Review' | 'Completed';
  location?: string;
  assignment_id: number;
  rejection_reason?: string;
}

const statusConfig = {
  'Yet to start': { label: 'Pending', className: 'status-pending', icon: Clock },
  'Ongoing': { label: 'In Progress', className: 'bg-sky/20 text-sky border-sky/30', icon: Play },
  'In Review': { label: 'In Review', className: 'bg-orange-100 text-orange-600 border-orange-200', icon: Clock },
  'Completed': { label: 'Completed', className: 'status-completed', icon: CheckCircle2 },
};

export default function WorkerTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAssignmentsApi.getMyAssignments();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'Yet to start');
  const inProgressTasks = tasks.filter((t) => t.status === 'Ongoing');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const handleStartTask = async (taskId: number) => {
    try {
      await tasksApi.updateStatus(taskId.toString(), 'Ongoing');
      toast({
        title: 'Task Started',
        description: 'The task has been marked as in progress.',
      });
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitTask = async (taskId: number) => {
    try {
      await tasksApi.submit(taskId.toString());
      toast({
        title: 'Task Submitted',
        description: 'Task submitted for manager review.',
      });
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit task.',
        variant: 'destructive',
      });
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const status = statusConfig[task.status] || statusConfig['Yet to start'];
    const StatusIcon = status.icon;

    return (
      <Card className="nature-card animate-fade-in">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-lg">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.project_name}</p>
            </div>
            {/* Priority is not in backend yet, handled via logic or omitted */}
          </div>

          {task.rejection_reason && task.status === 'Ongoing' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Revision Requested:</span> {task.rejection_reason}
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{task.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            {task.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{task.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Badge className={status.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <div className="flex gap-2">
              {task.status === 'Yet to start' && (
                <Button
                  size="sm"
                  onClick={() => handleStartTask(task.task_id)}
                  className="rounded-lg gradient-forest text-primary-foreground"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              {task.status === 'Ongoing' && (
                <Button
                  size="sm"
                  onClick={() => handleSubmitTask(task.task_id)}
                  className="rounded-lg gradient-forest text-primary-foreground"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Submit for Review
                </Button>
              )}
              {task.status === 'In Review' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Waiting for Approval
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="View and manage your assigned tasks"
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Active ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))}
            {tasks.length === 0 && <p className="col-span-2 text-center text-muted-foreground">No tasks found.</p>}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))}
            {pendingTasks.length === 0 && <p className="col-span-2 text-center text-muted-foreground">No pending tasks.</p>}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))}
            {inProgressTasks.length === 0 && <p className="col-span-2 text-center text-muted-foreground">No active tasks.</p>}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))}
            {completedTasks.length === 0 && <p className="col-span-2 text-center text-muted-foreground">No completed tasks.</p>}
          </div>
        </TabsContent>
      </Tabs>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks assigned yet.</p>
        </div>
      )}
    </div>
  );
}
