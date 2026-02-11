import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, MapPin, Users, ClipboardList, TreeDeciduous, Waves, Mountain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectsApi, usersApi } from '@/services/api';
import { ProjectDetailsDialog } from './ProjectDetailsDialog';


// Project interface
interface Project {
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'Yet to start' | 'Ongoing' | 'In Review' | 'Completed' | 'planning' | 'active' | 'completed';
  assigned_manager_id: number;
  created_at: string;
  updated_at: string;
  manager_name?: string; // Added for display purposes
  // Additional properties
  location?: string;
  google_maps_link?: string;
  location_type?: 'On-site' | 'Remote' | 'Hybrid';
  progress?: number;
  tasks?: { total: number; completed: number };
  workers?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

// Manager interface
interface Manager {
  user_id: number;
  name: string;
  email: string;
  role: string;
  manager_id: number | null;
  created_at: string;
  updated_at: string;
}

const statusStyles = {
  active: 'status-active',
  completed: 'status-completed',
  planning: 'status-pending',
  'on-hold': 'bg-muted text-muted-foreground',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    assigned_manager_id: '' as any, // Cast to any to handle string/number mismatch in form binding
    start_date: '',
    end_date: '',
    location: '',
    google_maps_link: '',
    location_type: 'On-site'
  });

  // State for details dialog
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { toast } = useToast();


  // Fetch projects and managers from API
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch projects and managers in parallel
      const [projectsResponse, managersResponse] = await Promise.all([
        projectsApi.getAll(),
        usersApi.getManagers()
      ]);

      const managersData = managersResponse.data;

      // Combine project data with manager names for display
      const projectsWithManagers = projectsResponse.data.map((project: any) => {
        // Calculate progress
        const totalTasks = project.total_tasks || 0;
        const completedTasks = project.completed_tasks || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          // Manager name is already in the project object if using findProjectsByManager or findAllProjects with the new join? 
          // Actually, findAllProjects has p.*. If assigned_manager_id is present, we might need to look it up if the join didn't bring the name.
          // The backend update was: SELECT p.* ... LEFT JOIN task ...
          // It did NOT join 'user' table for manager name.
          // So we still need the manager lookup logic if it was there, or rely on frontend matching.
          manager_name: managersData.find((m: any) => m.user_id === project.assigned_manager_id)?.name || 'Unassigned',

          status: project.status === 'Yet to start' ? 'planning' :
            project.status === 'Ongoing' ? 'active' :
              project.status === 'In Review' ? 'active' :
                'completed',

          progress: progress,
          tasks: { total: totalTasks, completed: completedTasks },
          workers: project.assigned_workers_count || 0,
          // location is now in project object from DB, default text below if null
          location: project.location || 'Location TBD',
          icon: TreeDeciduous
        };
      });

      setProjects(projectsWithManagers);
      setManagers(managersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects and managers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.manager_name && p.manager_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        assigned_manager_id: typeof newProject.assigned_manager_id === 'string' ? parseInt(newProject.assigned_manager_id) : newProject.assigned_manager_id,
        location: newProject.location,
        google_maps_link: newProject.google_maps_link,
        location_type: newProject.location_type
      };

      await projectsApi.create(projectData);

      // Refresh projects list
      await fetchData();

      setNewProject({
        name: '', description: '', assigned_manager_id: '' as any, start_date: '', end_date: '',
        location: '', google_maps_link: '', location_type: 'On-site'
      });
      setIsDialogOpen(false);
      toast({
        title: 'Project Created',
        description: `${newProject.name} has been created successfully.`,
        variant: 'default' // Changed to default for success
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create project',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage environmental conservation projects"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-forest text-primary-foreground rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new conservation project and assign a manager.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g., Wetland Restoration"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe the project goals and scope"
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Site Name</Label>
                <Input
                  id="location"
                  value={newProject.location || ''}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  placeholder="e.g., Riverside Park, Zone B"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps_link">Google Maps Link (Optional)</Label>
                <Input
                  id="google_maps_link"
                  value={newProject.google_maps_link || ''}
                  onChange={(e) => setNewProject({ ...newProject, google_maps_link: e.target.value })}
                  placeholder="Paste Google Maps URL here"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_type">Location Type</Label>
                <Select
                  value={newProject.location_type || 'On-site'}
                  onValueChange={(value: 'On-site' | 'Remote' | 'Hybrid') => setNewProject({ ...newProject, location_type: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Assign Manager</Label>
                <Select
                  value={newProject.assigned_manager_id ? newProject.assigned_manager_id.toString() : ''}
                  onValueChange={(value) => setNewProject({ ...newProject, assigned_manager_id: parseInt(value) })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.user_id} value={manager.user_id.toString()}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground">
                  Create Project
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
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => {
            const Icon = project.icon;
            return (
              <Card
                key={project.project_id}
                className="nature-card animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-display">{project.name}</CardTitle>
                        <Badge className={statusStyles[project.status as keyof typeof statusStyles]}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{project.manager_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ClipboardList className="w-4 h-4" />
                      <span>{project.tasks.completed}/{project.tasks.total} Tasks</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(project.workers, 3))].map((_, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-secondary/20 border-2 border-card flex items-center justify-center text-xs font-medium"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      {project.workers > 3 && (
                        <span className="text-sm text-muted-foreground">+{project.workers - 3}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => {
                        setSelectedProjectId(project.project_id);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your search.</p>
        </div>
      )}
      <ProjectDetailsDialog
        projectId={selectedProjectId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
