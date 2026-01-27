import React, { useState } from 'react';
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

const demoProjects = [
  {
    id: '1',
    name: 'River Cleanup Initiative',
    description: 'Cleaning up the local river system and restoring natural habitats.',
    manager: 'John Forest',
    status: 'active',
    progress: 65,
    tasks: { total: 24, completed: 15 },
    workers: 8,
    location: 'Northern River Basin',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    icon: Waves,
  },
  {
    id: '2',
    name: 'Forest Restoration Project',
    description: 'Replanting native trees and monitoring forest health in degraded areas.',
    manager: 'Emily Rivers',
    status: 'active',
    progress: 40,
    tasks: { total: 30, completed: 12 },
    workers: 12,
    location: 'Eastern Forest Reserve',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    icon: TreeDeciduous,
  },
  {
    id: '3',
    name: 'Mountain Trail Conservation',
    description: 'Maintaining hiking trails and protecting mountain ecosystem.',
    manager: 'Michael Oak',
    status: 'planning',
    progress: 10,
    tasks: { total: 18, completed: 2 },
    workers: 5,
    location: 'Blue Mountain Range',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    icon: Mountain,
  },
];

const managers = ['John Forest', 'Emily Rivers', 'Michael Oak', 'Unassigned'];

const statusStyles = {
  active: 'status-active',
  completed: 'status-completed',
  planning: 'status-pending',
  'on-hold': 'bg-muted text-muted-foreground',
};

export default function Projects() {
  const [projects, setProjects] = useState(demoProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    manager: '',
    location: '',
    startDate: '',
    endDate: '',
  });
  const { toast } = useToast();

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const project = {
      id: Date.now().toString(),
      ...newProject,
      status: 'planning' as const,
      progress: 0,
      tasks: { total: 0, completed: 0 },
      workers: 0,
      icon: TreeDeciduous,
    };
    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', manager: '', location: '', startDate: '', endDate: '' });
    setIsDialogOpen(false);
    toast({
      title: 'Project Created',
      description: `${newProject.name} has been created and assigned to ${newProject.manager || 'unassigned'}.`,
    });
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Assign Manager</Label>
                  <Select
                    value={newProject.manager}
                    onValueChange={(value) => setNewProject({ ...newProject, manager: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="Project location"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project, index) => {
          const Icon = project.icon;
          return (
            <Card
              key={project.id}
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
                    <span>{project.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
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
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your search.</p>
        </div>
      )}
    </div>
  );
}
