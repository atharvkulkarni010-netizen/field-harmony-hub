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
import { UserPlus, Search, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/services/api';

// Worker interface
interface Worker {
  user_id: string;
  name: string;
  email: string;
  role: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
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

const statusConfig = {
  'checked-in': { label: 'Checked In', icon: CheckCircle2, className: 'status-active' },
  'checked-out': { label: 'Checked Out', icon: Clock, className: 'status-pending' },
  'on-leave': { label: 'On Leave', icon: XCircle, className: 'bg-muted text-muted-foreground' },
};

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', manager_id: '' });
  const { toast } = useToast();

  // Fetch workers and managers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workers and managers
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

    fetchData();
  }, [toast]);

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (managers.find(m => m.user_id === w.manager_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  /* import { usersApi } from '@/services/api'; */ // Remove this line

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usersApi.register({
        name: newWorker.name,
        email: newWorker.email,
        role: 'WORKER',
        manager_id: newWorker.manager_id || null
      });
      
      setNewWorker({ name: '', email: '', manager_id: '' });
      setIsDialogOpen(false);

      toast({
        title: 'Worker Created',
        description: `Worker has been added successfully. Credentials sent to email.`,
      });
      
      // Refresh workers list in background
      const workersResponse = await usersApi.getWorkers();
      setWorkers(workersResponse.data);
    } catch (error: any) {
      console.error('Error creating worker:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create worker',
        variant: 'destructive'
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Manage field workers and their assignments"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-forest text-primary-foreground rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Worker</DialogTitle>
              <DialogDescription>
                Add a new field worker and assign them to a manager.
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
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Worker'}
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
                    <TableHead className="text-right">Active Tasks</TableHead>
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
                          <Badge className="status-active">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">0</TableCell>
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
