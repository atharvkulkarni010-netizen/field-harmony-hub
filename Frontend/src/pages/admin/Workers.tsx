import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Search, Mail, CheckCircle2, Clock, XCircle, Trash2, AlertCircle, Pencil, Check, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersApi, skillsApi } from '@/services/api';
import ReactSelect from 'react-select';

// Worker interface
interface Worker {
  user_id: string;
  name: string;
  email: string;
  role: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  active_tasks: number;
  today_status: string | null;
  skills: string[];
}

// Manager interface for dropdown
interface Manager {
  user_id: string;
  name: string;
  email: string;
  role: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  'PRESENT': { label: 'Present', icon: CheckCircle2, className: 'status-active' },
  'INCOMPLETE': { label: 'Incomplete', icon: Clock, className: 'status-pending' },
  'LEAVE': { label: 'On Leave', icon: XCircle, className: 'bg-muted text-muted-foreground' },
  'ABSENT': { label: 'Absent', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [newWorker, setNewWorker] = useState<{ name: string; email: string; manager_id: string; skills: string[] }>({ name: '', email: '', manager_id: '', skills: [] });
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [skillOptions, setSkillOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const { toast } = useToast();

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#16a34a' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #16a34a' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#16a34a' : '#cbd5e1',
      },
      padding: '0px 2px',
      minHeight: '40px',
      fontSize: '0.875rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#16a34a' : state.isFocused ? '#dcfce7' : 'white',
      color: state.isSelected ? 'white' : 'black',
      cursor: 'pointer',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#f1f5f9',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#0f172a',
      fontSize: '0.85rem',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#64748b',
      ':hover': {
        backgroundColor: '#fee2e2',
        color: '#ef4444',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#94a3b8',
    }),
  };

  // Fetch workers and managers from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersResponse, managersResponse] = await Promise.all([
        usersApi.getWorkers(),
        usersApi.getManagers()
      ]);

      setWorkers(workersResponse.data);
      setManagers(managersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workers and managers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (isDialogOpen) {
      const fetchSkills = async () => {
        setLoadingSkills(true);
        try {
          const response = await skillsApi.getAll();
          setSkillOptions(response.data.map((skill: any) => ({ label: skill.name, value: skill.name })));
        } catch (error) {
          console.error('Failed to fetch skills', error);
        }
        setLoadingSkills(false);
      };
      fetchSkills();
    }
  }, [isDialogOpen]);

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (managers.find(m => m.user_id === w.manager_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingWorkerId) {
        await usersApi.update(editingWorkerId, {
          name: newWorker.name,
          email: newWorker.email,
          role: 'WORKER',
          manager_id: newWorker.manager_id || null,
          skills: newWorker.skills
        });
        toast({
          title: 'Worker Updated',
          description: `Worker details have been updated successfully.`,
        });
      } else {
        await usersApi.register({
          name: newWorker.name,
          email: newWorker.email,
          role: 'WORKER',
          manager_id: newWorker.manager_id || null,
          skills: newWorker.skills
        });
        toast({
          title: 'Worker Created',
          description: `Worker has been added successfully. Credentials sent to email.`,
        });
      }

      setNewWorker({ name: '', email: '', manager_id: '', skills: [] });
      setEditingWorkerId(null);
      setIsDialogOpen(false);

      // Refresh workers list
      fetchData();
    } catch (error: any) {
      console.error('Error saving worker:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save worker',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWorker = (worker: Worker) => {
    setNewWorker({
      name: worker.name,
      email: worker.email,
      manager_id: worker.manager_id || '',
      skills: worker.skills || []
    });
    setEditingWorkerId(worker.user_id);
    setIsDialogOpen(true);
  };

  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;

    try {
      await usersApi.deleteUser(workerToDelete.user_id);

      toast({
        title: 'Worker Deleted',
        description: `${workerToDelete.name} has been removed successfully.`,
      });

      setIsDeleteDialogOpen(false);
      setWorkerToDelete(null);

      // Refresh list
      setWorkers(workers.filter(w => w.user_id !== workerToDelete.user_id));
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete worker',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config = statusConfig[status || 'ABSENT'] || statusConfig['ABSENT'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex w-fit items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Manage field workers and their assignments"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setNewWorker({ name: '', email: '', manager_id: '', skills: [] });
            setEditingWorkerId(null);
            setIsAddingSkill(false);
            setNewSkillName('');
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-forest text-primary-foreground rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">{editingWorkerId ? 'Edit Worker' : 'Create New Worker'}</DialogTitle>
              <DialogDescription>
                {editingWorkerId ? 'Update worker details and assignments.' : 'Add a new field worker and assign them to a manager.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWorker} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  placeholder="Enter full name"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  placeholder="Enter email address"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Assign Manager</Label>
                <Select
                  value={newWorker.manager_id}
                  onValueChange={(value) => setNewWorker({ ...newWorker, manager_id: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.user_id} value={manager.user_id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="skills">Skills</Label>
                  {!isAddingSkill && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(true)}
                      className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Skill
                    </button>
                  )}
                </div>

                {isAddingSkill ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Type new skill name..."
                      className="h-10 rounded-xl"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // handleSaveNewSkill
                          if (newSkillName.trim()) {
                            const saveSkill = async () => {
                              setIsSavingSkill(true);
                              try {
                                const response = await skillsApi.create(newSkillName.trim());
                                const newOption = { label: response.data.name, value: response.data.name };

                                setSkillOptions(prev => [...prev, newOption]);
                                setNewWorker(prev => ({
                                  ...prev,
                                  skills: [...(prev.skills || []), response.data.name]
                                }));

                                setNewSkillName('');
                                setIsAddingSkill(false);
                                toast({ description: "Skill added successfully" });
                              } catch (error) {
                                console.error("Failed to add skill", error);
                                toast({ variant: "destructive", description: "Failed to add skill" });
                              } finally {
                                setIsSavingSkill(false);
                              }
                            };
                            saveSkill();
                          }
                        } else if (e.key === 'Escape') {
                          setIsAddingSkill(false);
                          setNewSkillName('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSavingSkill || !newSkillName.trim()}
                      onClick={async () => {
                        if (!newSkillName.trim()) return;
                        setIsSavingSkill(true);
                        try {
                          const response = await skillsApi.create(newSkillName.trim());
                          const newOption = { label: response.data.name, value: response.data.name };

                          setSkillOptions(prev => [...prev, newOption]);
                          setNewWorker(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), response.data.name]
                          }));

                          setNewSkillName('');
                          setIsAddingSkill(false);
                          toast({ description: "Skill added successfully" });
                        } catch (error) {
                          console.error("Failed to add skill", error);
                          toast({ variant: "destructive", description: "Failed to add skill" });
                        } finally {
                          setIsSavingSkill(false);
                        }
                      }}
                    >
                      {isSavingSkill ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkillName('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <ReactSelect
                    isMulti
                    isDisabled={loadingSkills}
                    isLoading={loadingSkills}
                    onChange={(newValue) => {
                      const skills = newValue.map((option: any) => option.value);
                      setNewWorker({ ...newWorker, skills });
                    }}
                    options={skillOptions}
                    value={skillOptions.filter((option) =>
                      newWorker.skills?.includes(option.value)
                    )}
                    styles={customStyles}
                    className="text-sm"
                    placeholder="Select skills..."
                    noOptionsMessage={() => "No skills found. Click 'Add New Skill' to create one."}
                  />
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingWorkerId ? 'Update Worker' : 'Create Worker')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Worker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{workerToDelete?.name}</strong>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorker} className="rounded-xl">
              Delete worker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search workers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Workers Table */}
      <Card className="nature-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading workers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Active Tasks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((worker) => {
                    const manager = managers.find(m => m.user_id === worker.manager_id);
                    return (
                      <TableRow key={worker.user_id} className="animate-fade-in">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-secondary-foreground">
                                {worker.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{worker.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {worker.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{manager ? manager.name : 'No Manager'}</TableCell>
                        <TableCell>
                          {getStatusBadge(worker.today_status)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {worker.active_tasks || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary transition-colors mr-1"
                            onClick={() => handleEditWorker(worker)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => {
                              setWorkerToDelete(worker);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No workers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
