'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, CheckCircle, Calendar, QrCode, LogIn, LogOut as LogOutIcon, Loader2 } from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/client-auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { format } from 'date-fns';

export default function CHWAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'CHW') {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadTodayStatus();
    loadSupervisors();
  }, []);

  const loadTodayStatus = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/attendance?type=my-status');
      const data = await response.json();
      setTodayAttendance(data.attendance);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupervisors = async () => {
    try {
      const response = await fetchWithAuth('/api/stats?type=users');
      const data = await response.json();
      const supervisorList = data.users?.filter((u: any) => u.role === 'SUPERVISOR') || [];
      setSupervisors(supervisorList);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedSupervisor) {
      toast.error('Please select a supervisor');
      return;
    }
    if (!qrCode.trim()) {
      toast.error('Please enter QR code');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetchWithAuth('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'chw-check-in',
          supervisorId: selectedSupervisor,
          qrCode: qrCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      toast.success(data.message);
      setQrCode('');
      loadTodayStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const response = await fetchWithAuth('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'chw-check-out',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-out failed');
      }

      toast.success(`Checked out successfully! Earned ${data.pointsEarned} points for ${data.hoursWorked} hours`);
      loadTodayStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  const isCheckedIn = todayAttendance?.status === 'CHECKED_IN';
  const isCheckedOut = todayAttendance?.status === 'CHECKED_OUT';

  return (
    <DashboardLayout user={user} role="CHW">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Attendance</h2>
          <p className="text-muted-foreground">Check in and out of your workday</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {todayAttendance && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Today's Status</CardTitle>
                      <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
                    </div>
                    {isCheckedIn && <Badge className="bg-green-500">Working</Badge>}
                    {isCheckedOut && <Badge variant="outline">Checked Out</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <LogIn className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check In Time</p>
                          <p className="text-lg font-semibold">
                            {format(new Date(todayAttendance.check_in_time), 'HH:mm')}
                          </p>
                        </div>
                      </div>

                      {todayAttendance.check_out_time && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <LogOutIcon className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Check Out Time</p>
                            <p className="text-lg font-semibold">
                              {format(new Date(todayAttendance.check_out_time), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {todayAttendance.supervisor && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Supervisor</p>
                            <p className="text-lg font-semibold">{todayAttendance.supervisor.name}</p>
                          </div>
                        </div>
                      )}

                      {todayAttendance.points_earned > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Points Earned</p>
                            <p className="text-lg font-semibold text-primary">
                              {todayAttendance.points_earned} points
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCheckedIn && (
                    <div className="mt-6 pt-6 border-t">
                      <Button
                        onClick={handleCheckOut}
                        disabled={actionLoading}
                        className="w-full h-12"
                        size="lg"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking Out...
                          </>
                        ) : (
                          <>
                            <LogOutIcon className="w-4 h-4 mr-2" />
                            Check Out Now
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!todayAttendance && (
              <Card>
                <CardHeader>
                  <CardTitle>Check In</CardTitle>
                  <CardDescription>Scan your supervisor's QR code to start your workday</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Your Supervisor</Label>
                    <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose supervisor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name} - {sup.county || 'No County'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Enter QR Code</Label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="AFYA-xxxxx-xxxxxx"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ask your supervisor to show you today's QR code
                    </p>
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={actionLoading || !selectedSupervisor || !qrCode.trim()}
                    className="w-full h-12"
                    size="lg"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Check In to Work
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    How Attendance Works
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Select your supervisor from the dropdown</li>
                    <li>• Get today's QR code from your supervisor</li>
                    <li>• Enter the QR code and click "Check In"</li>
                    <li>• Work your shift and complete tasks</li>
                    <li>• Click "Check Out" when you finish (or supervisor signs you out)</li>
                    <li>• Earn 10 points per hour worked automatically</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
