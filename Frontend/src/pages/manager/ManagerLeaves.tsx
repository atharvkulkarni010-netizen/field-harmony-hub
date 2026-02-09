import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { leavesApi } from '@/services/api';
import { Calendar, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ManagerLeaves() {
    const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
    const [allLeaves, setAllLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, allRes] = await Promise.all([
                leavesApi.getPending(),
                leavesApi.getTeamLeaves()
            ]);
            setPendingLeaves(pendingRes.data);
            setAllLeaves(allRes.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            toast({
                title: 'Error',
                description: 'Failed to load leave data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await leavesApi.approve(id);
                toast({ title: 'Approved', description: 'Leave request approved successfully' });
            } else {
                await leavesApi.reject(id);
                toast({ title: 'Rejected', description: 'Leave request rejected' });
            }
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: `Failed to ${action} leave`,
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'APPROVED': 'status-active',
            'PENDING': 'status-pending',
            'REJECTED': 'status-destructive',
        };
        return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Leave Management"
                description="Review and manage team leave requests"
            />

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                    <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                    <TabsTrigger value="history">Leave History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading...</div>
                    ) : pendingLeaves.length === 0 ? (
                        <Card className="nature-card text-center py-12">
                            <CardContent className="text-muted-foreground">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                                No pending leave requests.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingLeaves.map((leave) => (
                                <Card key={leave.leave_id} className="nature-card hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{leave.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{leave.email}</p>
                                                </div>
                                            </div>
                                            <Badge className="status-pending">PENDING</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-2 space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Reason:</p>
                                            <p className="text-sm text-muted-foreground italic">"{leave.reason}"</p>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                                                size="sm"
                                                onClick={() => handleAction(leave.leave_id, 'approve')}
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                className="flex-1" 
                                                size="sm"
                                                onClick={() => handleAction(leave.leave_id, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card className="nature-card">
                        <CardHeader>
                            <CardTitle>All Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {loading ? (
                                <div className="text-center py-12 text-muted-foreground">Loading...</div>
                            ) : allLeaves.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">No leave history found.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Worker</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Applied On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allLeaves.map((leave) => (
                                            <TableRow key={leave.leave_id}>
                                                <TableCell className="font-medium">
                                                    <div>{leave.name}</div>
                                                    <div className="text-xs text-muted-foreground">{leave.email}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                                                    {leave.reason}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(leave.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
