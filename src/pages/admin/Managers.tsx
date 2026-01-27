import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Mail, Phone, MapPin, FolderKanban, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo managers
const demoManagers = [
  {
    id: '1',
    name: 'John Forest',
    email: 'john.forest@ngo.org',
    phone: '+1 234 567 8901',
    location: 'Northern Region',
    projects: 5,
    workers: 12,
    status: 'active',
  },
  {
    id: '2',
    name: 'Emily Rivers',
    email: 'emily.rivers@ngo.org',
    phone: '+1 234 567 8902',
    location: 'Coastal Area',
    projects: 3,
    workers: 8,
    status: 'active',
  },
  {
    id: '3',
    name: 'Michael Oak',
    email: 'michael.oak@ngo.org',
    phone: '+1 234 567 8903',
    location: 'Mountain Zone',
    projects: 4,
    workers: 15,
    status: 'active',
  },
];

export default function Managers() {
  const [managers, setManagers] = useState(demoManagers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', phone: '', location: '' });
  const { toast } = useToast();

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    const manager = {
      id: Date.now().toString(),
      ...newManager,
      projects: 0,
      workers: 0,
      status: 'active',
    };
    setManagers([...managers, manager]);
    setNewManager({ name: '', email: '', phone: '', location: '' });
    setIsDialogOpen(false);
    toast({
      title: 'Manager Created',
      description: `${newManager.name} has been added successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        description="Manage your field operation managers"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-forest text-primary-foreground rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Manager</DialogTitle>
              <DialogDescription>
                Add a new manager to oversee field operations.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateManager} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
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
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
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
                  value={newManager.phone}
                  onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Region/Location</Label>
                <Input
                  id="location"
                  value={newManager.location}
                  onChange={(e) => setNewManager({ ...newManager, location: e.target.value })}
                  placeholder="Enter assigned region"
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl gradient-forest text-primary-foreground">
                  Create Manager
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
          placeholder="Search managers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredManagers.map((manager, index) => (
          <Card
            key={manager.id}
            className="nature-card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {manager.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-display">{manager.name}</CardTitle>
                    <Badge variant="outline" className="status-active mt-1">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{manager.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{manager.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{manager.location}</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  <span className="font-medium">{manager.projects}</span>
                  <span className="text-muted-foreground">Projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{manager.workers}</span>
                  <span className="text-muted-foreground">Workers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredManagers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No managers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
