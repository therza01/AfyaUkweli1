'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, ExternalLink, Loader2, Clock, MapPin } from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/client-auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { format } from 'date-fns';

export default function SupervisorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'SUPERVISOR') {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadTasks();
  }, [router, statusFilter]);

  const loadTasks = async () => {
    try {
      const response = await fetchWithAuth(`/api/task?status=${statusFilter}&limit=50`);
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    setActionLoading(true);

    try {
      const response = await fetchWithAuth('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, approved: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve');
      }

      toast.success(`Task approved! ${data.pointsAwarded} points awarded`, {
        description: 'View transactions on HashScan',
        action: {
          label: 'View',
          onClick: () => window.open(data.hashScanUrls.approval, '_blank'),
        },
      });

      setDialogOpen(false);
      loadTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (taskId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetchWithAuth('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, approved: false, reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject');
      }

      toast.success('Task rejected');
      setDialogOpen(false);
      setRejectionReason('');
      loadTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject task');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} role="SUPERVISOR">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Task Approvals</h2>
          <p className="text-muted-foreground">Review and verify CHW tasks</p>
        </div>

        <div className="flex gap-3 mb-6">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No {statusFilter.toLowerCase()} tasks found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono">
                              {task.task_id.slice(0, 10)}
                            </Badge>
                            <Badge
                              variant={
                                task.status === 'APPROVED' ? 'default' : task.status === 'REJECTED' ? 'destructive' : 'secondary'
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">
                            {task.task_type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">{task.notes}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(task.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {task.geohash}
                            </span>
                            <span>CHW: {task.chw?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog open={dialogOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setSelectedTask(task);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Task Review</DialogTitle>
                            <DialogDescription>
                              Review task details and approve or reject
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Task ID</Label>
                              <p className="text-sm font-mono bg-secondary p-2 rounded">{task.task_id}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <p className="text-sm">{task.task_type.replace('_', ' ')}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <p className="text-sm">{task.notes || 'No notes provided'}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>CHW</Label>
                              <p className="text-sm">{task.chw?.name} ({task.chw?.email})</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Submitted</Label>
                              <p className="text-sm">{format(new Date(task.created_at), 'PPpp')}</p>
                            </div>
                            {task.status === 'PENDING' && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="rejectionReason">Rejection Reason (optional)</Label>
                                  <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide reason for rejection..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => handleApprove(task.id)}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleReject(task.id)}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {task.hcs_log_txn_hash && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_HASHSCAN_BASE}/transaction/${task.hcs_log_txn_hash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
