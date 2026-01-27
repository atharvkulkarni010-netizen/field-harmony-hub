import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, MapPin, User, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoTasks = [
  {
    id: '1',
    title: 'Water Quality Testing',
    description: 'Collect water samples from 5 designated points along the river.',
    project: 'River Cleanup Initiative',
    assignee: 'Maria Rivers',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-03-15',
    location: 'River Basin - Point A to E',
  },
  {
    id: '2',
    title: 'Trail Maintenance',
    description: 'Clear fallen branches and mark trail boundaries.',
    project: 'River Cleanup Initiative',
    assignee: 'Carlos Leaf',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-03-16',
    location: 'Northern Trail Section',
  },
  {
    id: '3',
    title: 'Species Count',
    description: 'Document bird species observed in designated zones.',
    project: 'Wetland Survey',
    assignee: 'Aisha Green',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-03-14',
    location: 'Wetland Zone B',
  },
  {
    id: '4',
    title: 'Debris Removal',
    description: 'Remove plastic waste from riverbank areas.',
    project: 'River Cleanup Initiative',
    assignee: null,
    status: 'pending',
    priority: 'high',
    dueDate: '2024-03-17',
    location: 'River Bank Section 3',
  },
];

const workers = ['Maria Rivers', 'Carlos Leaf', 'Aisha Green', 'Luna Park', 'David Stone'];
const projects = ['River Cleanup Initiative', 'Wetland Survey'];

const statusConfig = {
  pending: { label: 'Pending', className: 'status-pending' },
  'in-progress': { label: 'In Progress', className: 'bg-sky/20 text-sky border-sky/30' },
  completed: { label: 'Completed', className: 'status-completed' },
};

const priorityConfig = {
  high: { label: 'High', className: 'bg-destructive/10 text-destructive' },
  medium: { label: 'Medium', className: 'bg-sun/20 text-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

export default function ManagerTasks() {
  const [tasks, setTasks] = useState(demoTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    location: '',
  });
  const { toast } = useToast();

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignee && t.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'pending' as const,
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', project: '', assignee: '', priority: 'medium', dueDate: '', location: '' });
    setIsDialogOpen(false);
    toast({
      title: 'Task Created',
      description: `${newTask.title} has been added to ${newTask.project}.`,
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    toast({
      title: 'Task Updated',
      description: `Task status changed to ${newStatus}.`,
    });
  };

  const TaskCard = ({ task }: { task: typeof demoTasks[0] }) => {
    const status = statusConfig[task.status as keyof typeof statusConfig];
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig];

    return (
      <Card className="nature-card animate-fade-in">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium line-clamp-1">{task.title}</h4>
            <Badge className={priority.className} variant="outline">
              {priority.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{task.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            {task.assignee ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{task.assignee}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="italic">Unassigned</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Badge className={status.className}>{status.label}</Badge>
            {task.status !== 'completed' && (
              <Select
                value={task.status}
                onValueChange={(value) => updateTaskStatus(task.id, value)}
              >
                <SelectTrigger className="w-auto h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Create and manage tasks for your team"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-forest text-primary-foreground rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task and assign it to a worker.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Water sampling at Point A"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the task details"
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newTask.project}
                    onValueChange={(value) => setNewTask({ ...newTask, project: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assignee}
                    onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker} value={worker}>
                          {worker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newTask.location}
                  onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                  placeholder="Task location"
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground">
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Tabs View */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Active ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found.</p>
        </div>
      )}
    </div>
  );
}
