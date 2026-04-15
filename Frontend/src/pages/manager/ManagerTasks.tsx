import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  projectsApi,
  usersApi,
  tasksApi,
  taskAssignmentsApi,
} from "@/services/api";

const statusConfig = {
  "Yet to start": { label: "Pending", className: "status-pending" },
  Ongoing: {
    label: "In Progress",
    className: "bg-sky/20 text-sky border-sky/30",
  },
  "In Review": {
    label: "In Review",
    className: "bg-purple/20 text-purple-600 border-purple/30",
  },
  Completed: { label: "Completed", className: "status-completed" },
};

// Map frontend status to backend status
const reverseStatusMap: Record<string, string> = {
  pending: "Yet to start",
  "in-progress": "Ongoing",
  completed: "Completed",
};

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/10 text-destructive" },
  medium: { label: "Medium", className: "bg-sun/20 text-foreground" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
};

interface Task {
  task_id: number;
  title: string;
  description: string;
  project_id: number;
  status: string;
  due_date: string;
  project_name?: string;
  assignee_name?: string;
  assignee_id?: number;
}

export default function ManagerTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project_id: "",
    assignee_id: "",
    priority: "medium", // Backend doesn't have priority yet, keeping for UI
    due_date: "",
    location: "", // Backend doesn't have location yet
  });
  const [rejectReason, setRejectReason] = useState("");
  const [taskToReject, setTaskToReject] = useState<number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get Profile to get Manager ID
      const profileRes = await usersApi.getProfile();
      const managerId = profileRes.data.user_id;

      // 2. Fetch Projects Assigned to Manager
      const projectsRes = await projectsApi.getAll();
      setProjects(projectsRes.data);

      // 3. Fetch Workers under Manager
      const workersRes = await usersApi.getManagerWorkers(managerId);
      setWorkers(workersRes.data);

      // 4. Fetch Tasks for all projects with assignments
      let allTasks: Task[] = [];
      let allAssignments: any[] = [];

      for (const project of projectsRes.data) {
        try {
          const tasksRes = await tasksApi.getByProject(project.project_id);
          const projectTasks = tasksRes.data.map((t: any) => ({
            ...t,
            project_name: project.name,
          }));
          allTasks = [...allTasks, ...projectTasks];

          // Fetch assignments for each task
          for (const task of projectTasks) {
            try {
              const assignmentsRes = await taskAssignmentsApi.getByTask(
                task.task_id.toString(),
              );
              const taskAssigns = assignmentsRes.data;
              allAssignments = [
                ...allAssignments,
                ...taskAssigns.map((assign: any) => ({
                  ...assign,
                  task_id: task.task_id,
                })),
              ];
            } catch (err) {
              // Task has no assignments yet
            }
          }
        } catch (err) {
          console.error(
            `Failed to fetch tasks for project ${project.project_id}`,
            err,
          );
        }
      }

      // Enrich tasks with assignee info
      const enrichedTasks = allTasks.map((task) => {
        const assignment = allAssignments.find(
          (a) => a.task_id === task.task_id,
        );
        return {
          ...task,
          assignee_id: assignment?.worker_id,
          assignee_name: assignment?.worker_name,
        };
      });

      setTasks(enrichedTasks);
      setTaskAssignments(allAssignments);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create Task
      const taskRes = await tasksApi.create(newTask.project_id, {
        title: newTask.title,
        description: newTask.description,
        start_date: new Date().toISOString().split("T")[0], // Default to today
        due_date: newTask.due_date,
      });
      const createdTask = taskRes.data.task;

      // 2. Assign Worker (if selected)
      if (newTask.assignee_id) {
        await tasksApi.assignWorker(
          createdTask.task_id.toString(),
          newTask.assignee_id,
        );
      }

      toast({
        title: "Task Created",
        description: `${newTask.title} created successfully.`,
      });

      setIsDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        project_id: "",
        assignee_id: "",
        priority: "medium",
        due_date: "",
        location: "",
      });
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const backendStatus = reverseStatusMap[newStatus];
      if (!backendStatus) return; // Should not happen

      await tasksApi.updateStatus(taskId.toString(), backendStatus);

      // Optimistic update
      setTasks(
        tasks.map((t) =>
          t.task_id === taskId ? { ...t, status: backendStatus } : t,
        ),
      );

      toast({
        title: "Task Updated",
        description: `Task status updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (taskId: number) => {
    try {
      await tasksApi.approve(taskId.toString());
      setTasks(
        tasks.map((t) =>
          t.task_id === taskId
            ? { ...t, status: "Completed", rejection_reason: null }
            : t,
        ),
      );
      toast({
        title: "Task Approved",
        description: "Task marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToReject || !rejectReason) return;

    try {
      await tasksApi.reject(taskToReject.toString(), rejectReason);
      setTasks(
        tasks.map((t) =>
          t.task_id === taskToReject
            ? { ...t, status: "Ongoing", rejection_reason: rejectReason }
            : t,
        ),
      );
      toast({
        title: "Task Rejected",
        description: "Task sent back for revision.",
      });
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setTaskToReject(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject task",
        variant: "destructive",
      });
    }
  };

  const openRejectDialog = (taskId: number) => {
    setTaskToReject(taskId);
    setIsRejectDialogOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    // Search filter
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.project_name &&
        t.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.assignee_name &&
        t.assignee_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Worker filter
    const matchesWorker =
      selectedWorker === "all" ||
      !selectedWorker ||
      t.assignee_id?.toString() === selectedWorker;

    // Date filter
    const matchesDate =
      !selectedDate ||
      (t.due_date && t.due_date.split("T")[0] === selectedDate);

    return matchesSearch && matchesWorker && matchesDate;
  });

  // Helper to map backend status to frontend tab keys
  const getTabStatus = (status: string) => {
    if (status === "Yet to start") return "pending";
    if (status === "Ongoing" || status === "In Review") return "in-progress";
    if (status === "Completed") return "completed";
    return "pending";
  };

  const pendingTasks = filteredTasks.filter(
    (t) => getTabStatus(t.status) === "pending",
  );
  const inProgressTasks = filteredTasks.filter(
    (t) => getTabStatus(t.status) === "in-progress",
  );
  const completedTasks = filteredTasks.filter(
    (t) => getTabStatus(t.status) === "completed",
  );

  const TaskCard = ({ task }: { task: Task }) => {
    const statusKey = task.status as keyof typeof statusConfig;
    const status = statusConfig[statusKey] || statusConfig["Yet to start"];

    return (
      <Card className="nature-card animate-fade-in">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium line-clamp-1">{task.title}</h4>
            <Badge variant="outline" className="text-xs">
              {task.project_name}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : "No due date"}
              </span>
            </div>
            {task.assignee_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{task.assignee_name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Badge className={status.className}>{status.label}</Badge>

            {statusKey === "In Review" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(task.task_id)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8"
                  onClick={() => openRejectDialog(task.task_id)}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            ) : (
              task.status !== "Completed" && (
                <Select
                  value={getTabStatus(task.status)}
                  onValueChange={(value) =>
                    updateTaskStatus(task.task_id, value)
                  }
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
              )
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
              <DialogTitle className="font-display">
                Create New Task
              </DialogTitle>
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
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="e.g., Water sampling"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Describe the task details"
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newTask.project_id}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, project_id: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.project_id}
                          value={project.project_id.toString()}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assignee_id}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, assignee_id: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem
                          key={worker.user_id}
                          value={worker.user_id.toString()}
                        >
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl gradient-forest text-primary-foreground"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reject Task
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this task. The worker will be
              notified to make revisions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 mt-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., The photo is blurry, please retake."
              className="min-h-[100px]"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Reject Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Worker Filter */}
          <Select value={selectedWorker} onValueChange={setSelectedWorker}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All workers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All workers
              </SelectItem>
              {workers.map((worker) => (
                <SelectItem
                  key={worker.user_id}
                  value={worker.user_id.toString()}
                >
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl"
            placeholder="Filter by due date"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading tasks...
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Active ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Done ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found.</p>
        </div>
      )}
    </div>
  );
}
