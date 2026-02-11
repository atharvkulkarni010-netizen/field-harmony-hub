import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    MapPin,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Activity,
    Lock,
    Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projectsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectDetailsDialogProps {
    projectId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectDetailsDialog({ projectId, open, onOpenChange }: ProjectDetailsDialogProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && projectId) {
            fetchDetails();
        } else {
            setData(null);
        }
    }, [open, projectId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await projectsApi.getDetails(projectId!);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching project details:', error);
            toast({
                title: 'Error',
                description: 'Failed to load project details',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = async () => {
        try {
            const response = await projectsApi.toggleLock(projectId!);
            setData({ ...data, is_locked: response.data.project.is_locked });
            toast({
                title: response.data.project.is_locked ? "Project Locked" : "Project Unlocked",
                description: response.data.message
            });
        } catch (error) {
            console.error('Error toggling lock:', error);
            toast({ title: 'Error', description: 'Failed to update lock status', variant: 'destructive' });
        }
    };

    if (!open) return null;

    const statusColors = {
        'Yet to start': 'text-muted-foreground bg-muted',
        'Ongoing': 'text-blue-600 bg-blue-100',
        'In Review': 'text-yellow-600 bg-yellow-100',
        'Completed': 'text-green-600 bg-green-100'
    };

    const getProgress = () => {
        if (!data) return 0;
        const total = data.total_tasks || 0;
        const completed = data.completed_tasks || 0;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {loading ? 'Loading...' : data?.name}
                            {!loading && data && (
                                <>
                                    <Badge className={statusColors[data.status as keyof typeof statusColors]}>
                                        {data.status}
                                    </Badge>
                                    {data.is_locked && <Badge variant="destructive" className="flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</Badge>}
                                </>
                            )}
                        </div>
                        {!loading && data && (
                            <Button variant={data.is_locked ? "outline" : "secondary"} size="sm" onClick={handleToggleLock}>
                                {data.is_locked ? <><Unlock className="w-4 h-4 mr-2" /> Unlock Project</> : <><Lock className="w-4 h-4 mr-2" /> Lock Project</>}
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : data ? (
                    <div className="space-y-6 mt-4">

                        {/* Overview & Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                                    <p className="text-sm leading-relaxed">{data.description || 'No description provided.'}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Project Progress</span>
                                        <span className="text-muted-foreground">{getProgress()}%</span>
                                    </div>
                                    <Progress value={getProgress()} className="h-2 w-full" />
                                </div>
                            </div>

                            <Card className="bg-muted/30 border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Key Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Timeline</span>
                                            <span className="font-medium">
                                                {new Date(data.start_date).toLocaleDateString()} - {new Date(data.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Manager</span>
                                            <span className="font-medium">{data.manager_name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Location</span>
                                            {data.google_maps_link ? (
                                                <a href={data.google_maps_link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                                    {data.location || 'View on Maps'}
                                                </a>
                                            ) : (
                                                <span className="font-medium">{data.location || 'Location TBD'}</span>
                                            )}
                                            {data.location_type && (
                                                <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                                    {data.location_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="tasks" className="w-full">
                            <TabsList>
                                <TabsTrigger value="tasks">Tasks ({data.tasks?.length || 0})</TabsTrigger>
                                <TabsTrigger value="team">Team ({data.team?.length || 0})</TabsTrigger>
                                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                            </TabsList>

                            {/* Tasks Tab */}
                            <TabsContent value="tasks" className="space-y-4 mt-4">
                                {data.tasks?.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No tasks assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.tasks.map((task: any) => (
                                            <div key={task.task_id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    {task.status === 'Completed' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                                    ) : task.status === 'In Review' ? (
                                                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Assigned to: {task.worker_name || 'Unassigned'} • Due: {new Date(task.due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {task.status === 'In Review' && (
                                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                            Verification Needed
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">{task.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Team Tab */}
                            <TabsContent value="team" className="mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {data.team?.map((member: any) => (
                                        <div key={member.user_id} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-muted-foreground uppercase">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {data.team?.length === 0 && (
                                        <p className="col-span-full text-center text-muted-foreground py-8">No team members assigned.</p>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Activity Log Tab */}
                            <TabsContent value="activity" className="mt-4">
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="space-y-6 pl-2">
                                        {data.activityLog?.map((log: any, index: number) => (
                                            <div key={index} className="relative pl-6 border-l border-border pb-1 last:border-0 last:pb-0">
                                                <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ${log.type === 'project' ? 'bg-primary' : 'bg-muted-foreground'
                                                    }`} />
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">{log.action}</p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{log.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {data.activityLog?.length === 0 && (
                                            <p className="text-center text-muted-foreground py-8">No recent activity.</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>

                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">Failed to load details.</div>
                )}
            </DialogContent>
        </Dialog>
    );
}
