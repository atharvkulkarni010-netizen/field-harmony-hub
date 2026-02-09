import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Users, ClipboardList, TreeDeciduous } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/services/api';

// Project interface (Simplified for display)
interface Project {
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'Yet to start' | 'Ongoing' | 'In Review' | 'Completed' | 'planning' | 'active' | 'completed';
  assigned_manager_id: number;
  // Extras
  progress?: number;
  tasks?: { total: number; completed: number };
  workers?: number;
  location?: string;
  icon?: any;
}

const statusStyles = {
  active: 'status-active',
  completed: 'status-completed',
  planning: 'status-pending',
  'Yet to start': 'status-pending',
  'Ongoing': 'status-active',
  'In Review': 'status-active',
  'Completed': 'status-completed',
};

export default function ManagerProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.getAll(); // Returns filtered list for managers
      
      const enrichedProjects = res.data.map((project: any) => {
        // Calculate progress
        const totalTasks = project.total_tasks || 0;
        const completedTasks = project.completed_tasks || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          progress: progress,
          tasks: { total: totalTasks, completed: completedTasks },
          workers: project.assigned_workers_count || 0,
          location: 'Site Location', // TBD
          icon: TreeDeciduous
        };
      });
      
      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Projects"
        description="Projects assigned to you for management"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search your projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => {
            const Icon = project.icon || TreeDeciduous;
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
                        <Badge className={statusStyles[project.status as keyof typeof statusStyles] || 'status-pending'}>
                          {project.status}
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
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ClipboardList className="w-4 h-4" />
                      <span>{project.tasks?.completed}/{project.tasks?.total} Tasks</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Users className="w-4 h-4" />
                       <span>{project.workers} Workers</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
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
           <p className="text-muted-foreground">No projects assigned to you yet.</p>
         </div>
      )}
    </div>
  );
}
