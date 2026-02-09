import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { leaveApi } from '@/services/api';

const leaveTypes = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'other', label: 'Other' },
];

const statusConfig = {
  APPROVED: { label: 'Approved', className: 'status-completed', icon: CheckCircle2 },
  PENDING: { label: 'Pending', className: 'status-pending', icon: Clock },
  REJECTED: { label: 'Rejected', className: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function ApplyLeave() {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState({
    total: 20, // Default allowance
    used: 0,
    pending: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_id) {
      fetchLeaveHistory();
    }
  }, [user]);

  const fetchLeaveHistory = async () => {
    try {
      const response = await leaveApi.getHistory(user!.user_id);
      const history = response.data;
      setLeaves(history);
      
      // Calculate balance
      let used = 0;
      let pending = 0;
      
      history.forEach((leave: any) => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (leave.status === 'APPROVED') {
          used += days;
        } else if (leave.status === 'PENDING') {
          pending += days;
        }
      });
      
      setLeaveBalance(prev => ({
        ...prev,
        used,
        pending
      }));

    } catch (error) {
      console.error('Error fetching leave history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leave history.',
        variant: 'destructive',
      });
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      toast({
        title: 'All fields required',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const days = calculateDays();
    const available = leaveBalance.total - leaveBalance.used;

    if (days > available) {
      toast({
        title: 'Insufficient Leave Balance',
        description: `You only have ${available} days available.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Append leave type to reason or handle it if backend supports leave_type column (currently it doesn't, so we prepend it to reason)
      // The schema only has 'reason', so let's combine type + reason or just send reason.
      // Ideally we should add a column, but let's stick to existing schema to minimize DB changes unless necessary.
      // Let's prepend "[Type] " to reason.
      const fullReason = `[${leaveType}] ${reason}`;
      
      await leaveApi.apply({
        start_date: startDate,
        end_date: endDate,
        reason: fullReason
      });

      toast({
        title: 'Leave Request Submitted',
        description: `Your ${days}-day leave request has been sent for approval.`,
      });

      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaveHistory(); // Refresh list
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit your leave request"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="nature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <Calendar className="w-5 h-5 text-primary" />
                  Leave Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.label}>
                          {type.label}
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
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl"
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {calculateDays()} day(s)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for your leave request..."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl gradient-forest text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Leave Balance & History */}
        <div className="space-y-6">
          {/* Balance */}
          <Card className="nature-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {leaveBalance.total - leaveBalance.used}
                </p>
                <p className="text-sm text-muted-foreground">days available</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Allowance</span>
                  <span className="font-medium">{leaveBalance.total} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{leaveBalance.used} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-sun">{leaveBalance.pending} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="nature-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Recent Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No leave requests yet</p>
              ) : (
                leaves.map((leave) => {
                  const status = statusConfig[leave.status as keyof typeof statusConfig] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  // Try to extract type from reason if formatted as "[Type] Reason"
                  const match = leave.reason?.match(/^\[(.*?)\]/);
                  const type = match ? match[1] : 'Leave';
                  
                  const start = new Date(leave.start_date);
                  const end = new Date(leave.end_date);
                  const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <div
                      key={leave.leave_id}
                      className="p-3 rounded-xl bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium truncate max-w-[120px]" title={type}>{type}</p>
                        <Badge className={status.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                        <span className="ml-2">({days} day{days > 1 ? 's' : ''})</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={leave.reason}>
                         {leave.reason.replace(/^\[.*?\]\s*/, '')}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
