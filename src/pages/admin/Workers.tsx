import React, { useState } from 'react';
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
import { UserPlus, Search, Mail, Phone, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo workers
const demoWorkers = [
  { id: '1', name: 'Maria Rivers', email: 'maria@ngo.org', phone: '+1 234 567 0001', manager: 'John Forest', status: 'checked-in', tasks: 4 },
  { id: '2', name: 'Carlos Leaf', email: 'carlos@ngo.org', phone: '+1 234 567 0002', manager: 'John Forest', status: 'checked-out', tasks: 6 },
  { id: '3', name: 'Aisha Green', email: 'aisha@ngo.org', phone: '+1 234 567 0003', manager: 'Emily Rivers', status: 'checked-in', tasks: 3 },
  { id: '4', name: 'David Stone', email: 'david@ngo.org', phone: '+1 234 567 0004', manager: 'Michael Oak', status: 'on-leave', tasks: 0 },
  { id: '5', name: 'Luna Park', email: 'luna@ngo.org', phone: '+1 234 567 0005', manager: 'Emily Rivers', status: 'checked-in', tasks: 5 },
];

const managers = ['John Forest', 'Emily Rivers', 'Michael Oak'];

const statusConfig = {
  'checked-in': { label: 'Checked In', icon: CheckCircle2, className: 'status-active' },
  'checked-out': { label: 'Checked Out', icon: Clock, className: 'status-pending' },
  'on-leave': { label: 'On Leave', icon: XCircle, className: 'bg-muted text-muted-foreground' },
};

export default function Workers() {
  const [workers, setWorkers] = useState(demoWorkers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', phone: '', manager: '' });
  const { toast } = useToast();

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = {
      id: Date.now().toString(),
      ...newWorker,
      status: 'checked-out' as const,
      tasks: 0,
    };
    setWorkers([...workers, worker]);
    setNewWorker({ name: '', email: '', phone: '', manager: '' });
    setIsDialogOpen(false);
    toast({
      title: 'Worker Created',
      description: `${newWorker.name} has been added and assigned to ${newWorker.manager}.`,
    });
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Assign Manager</Label>
                <Select
                  value={newWorker.manager}
                  onValueChange={(value) => setNewWorker({ ...newWorker, manager: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a manager" />
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
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground">
                  Create Worker
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
                  const status = statusConfig[worker.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={worker.id} className="animate-fade-in">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {worker.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{worker.manager}</TableCell>
                      <TableCell>
                        <Badge className={status.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{worker.tasks}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No workers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
