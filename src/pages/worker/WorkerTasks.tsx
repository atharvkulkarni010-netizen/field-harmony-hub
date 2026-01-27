import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Calendar, MapPin, CheckCircle2, Clock, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoTasks = [
  {
    id: '1',
    title: 'Water Quality Testing',
    description: 'Collect water samples from 5 designated points along the river and test for pH, dissolved oxygen, and contaminants.',
    project: 'River Cleanup Initiative',
    priority: 'high',
    dueDate: '2024-03-15',
    status: 'in-progress',
    location: 'River Basin - Point A to E',
  },
  {
    id: '2',
    title: 'Sample Collection',
    description: 'Collect soil samples from marked areas for laboratory analysis.',
    project: 'River Cleanup Initiative',
    priority: 'medium',
    dueDate: '2024-03-16',
    status: 'pending',
    location: 'Riverbank Section 3',
  },
  {
    id: '3',
    title: 'Equipment Maintenance',
    description: 'Check and maintain all testing equipment. Report any damages.',
    project: 'River Cleanup Initiative',
    priority: 'low',
    dueDate: '2024-03-17',
    status: 'pending',
    location: 'Base Camp',
  },
  {
    id: '4',
    title: 'Bird Species Documentation',
    description: 'Document and photograph bird species observed in the wetland area.',
    project: 'Wetland Survey',
    priority: 'medium',
    dueDate: '2024-03-14',
    status: 'completed',
    location: 'Wetland Zone B',
  },
];

const priorityConfig = {
  high: { label: 'High', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium', className: 'bg-sun/20 text-foreground border-sun/30' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground border-muted' },
};

const statusConfig = {
  pending: { label: 'Pending', className: 'status-pending', icon: Clock },
  'in-progress': { label: 'In Progress', className: 'bg-sky/20 text-sky border-sky/30', icon: Play },
  completed: { label: 'Completed', className: 'status-completed', icon: CheckCircle2 },
};

export default function WorkerTasks() {
  const { toast } = useToast();

  const pendingTasks = demoTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = demoTasks.filter((t) => t.status === 'in-progress');
  const completedTasks = demoTasks.filter((t) => t.status === 'completed');

  const handleStartTask = (taskId: string) => {
    toast({
      title: 'Task Started',
      description: 'The task has been marked as in progress.',
    });
  };

  const handleCompleteTask = (taskId: string) => {
    toast({
      title: 'Task Completed',
      description: 'Great work! The task has been marked as complete.',
    });
  };

  const TaskCard = ({ task }: { task: typeof demoTasks[0] }) => {
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
    const status = statusConfig[task.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
      <Card className="nature-card animate-fade-in">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-lg">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.project}</p>
            </div>
            <Badge variant="outline" className={priority.className}>
              {priority.label}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{task.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{task.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Badge className={status.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <div className="flex gap-2">
              {task.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => handleStartTask(task.id)}
                  className="rounded-lg gradient-forest text-primary-foreground"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                  className="rounded-lg gradient-forest text-primary-foreground"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="View and manage your assigned tasks"
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All ({demoTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Active ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {demoTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks assigned yet.</p>
        </div>
      )}
    </div>
  );
}
