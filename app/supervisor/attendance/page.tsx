'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { QrCode, Users, Clock, CheckCircle, XCircle, Loader2, Calendar, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/client-auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { format } from 'date-fns';
import QRCode from 'qrcode';

export default function SupervisorAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [allChws, setAllChws] = useState<any[]>([]);
  const [selectedChw, setSelectedChw] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'SUPERVISOR') {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadQRCode();
    loadChws();
    loadAttendance();
  }, []);

  const loadQRCode = async () => {
    try {
      const response = await fetchWithAuth('/api/qr-code');
      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        const qrImage = await QRCode.toDataURL(data.qrCode, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeImage(qrImage);
      }
    } catch (error) {
      console.error('Failed to load QR code:', error);
    }
  };

  const generateNewQRCode = async () => {
    try {
      const response = await fetchWithAuth('/api/qr-code', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        const qrImage = await QRCode.toDataURL(data.qrCode, {
          width: 300,
          margin: 2,
        });
        setQrCodeImage(qrImage);
        toast.success('QR Code generated for today');
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const loadChws = async () => {
    try {
      const response = await fetchWithAuth('/api/attendance?type=supervisor-chws');
      const data = await response.json();
      setAllChws(data.chws || []);
    } catch (error) {
      console.error('Failed to load CHWs:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/attendance?type=supervisor-view&date=${selectedDate}`);
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [selectedDate]);

  const handleCheckIn = async () => {
    if (!selectedChw) {
      toast.error('Please select a CHW');
      return;
    }

    if (!qrCode) {
      toast.error('Please generate QR code first');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetchWithAuth('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'supervisor-check-in',
          chwId: selectedChw,
          qrCode: qrCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      toast.success(data.message);
      setSelectedChw('');
      loadAttendance();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (chwId: string, chwName: string) => {
    try {
      setActionLoading(true);
      const response = await fetchWithAuth('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({
          action: 'supervisor-check-out',
          chwId: chwId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-out failed');
      }

      toast.success(`${chwName} checked out. Points: ${data.pointsEarned}`);
      loadAttendance();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'CHECKED_IN') {
      return <Badge className="bg-green-500">Working</Badge>;
    }
    return <Badge variant="outline">Checked Out</Badge>;
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  if (!user) return null;

  const checkedInCount = attendance.filter(a => a.status === 'CHECKED_IN').length;
  const checkedOutCount = attendance.filter(a => a.status === 'CHECKED_OUT').length;
  const totalPoints = attendance.reduce((sum, a) => sum + (a.points_earned || 0), 0);

  const availableChws = allChws.filter(chw =>
    !attendance.find(a => a.chw_id === chw.id && a.status === 'CHECKED_IN')
  );

  return (
    <DashboardLayout user={user} role="SUPERVISOR">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">CHW Attendance Management</h2>
          <p className="text-muted-foreground">Sign CHWs in/out and track their work hours</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's QR Code</CardTitle>
                  <CardDescription>CHWs scan this to verify</CardDescription>
                </div>
                <QrCode className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {qrCodeImage ? (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCodeImage} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Valid: {format(new Date(), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {qrCode}
                    </p>
                  </div>
                  <Button
                    onClick={generateNewQRCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Regenerate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={generateNewQRCode}>
                    Generate QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sign In CHW</CardTitle>
              <CardDescription>Select a CHW and sign them in to start their workday</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select CHW to Sign In</Label>
                <Select value={selectedChw} onValueChange={setSelectedChw}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose CHW..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChws.length === 0 ? (
                      <SelectItem value="none" disabled>
                        All CHWs already signed in
                      </SelectItem>
                    ) : (
                      availableChws.map((chw) => (
                        <SelectItem key={chw.id} value={chw.id}>
                          {chw.name} ({chw.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCheckIn}
                disabled={actionLoading || !selectedChw || !qrCode}
                className="w-full h-11"
                size="lg"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In CHW
                  </>
                )}
              </Button>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
                  <p className="text-xs text-muted-foreground">Working Now</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{checkedOutCount}</p>
                  <p className="text-xs text-muted-foreground">Checked Out</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>Manage CHW work hours and sign-outs</CardDescription>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records for {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </div>
            ) : (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{record.chw_name}</p>
                        <p className="text-sm text-muted-foreground">{record.chw_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(record.check_in_time), 'HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">Check In</p>
                      </div>

                      {record.check_out_time ? (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(new Date(record.check_out_time), 'HH:mm')}
                            </p>
                            <p className="text-xs text-muted-foreground">Check Out</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {calculateDuration(record.check_in_time, record.check_out_time)}h
                            </p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">{record.points_earned}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleCheckOut(record.chw_id, record.chw_name)}
                          disabled={actionLoading}
                          size="sm"
                          variant="outline"
                        >
                          <LogOutIcon className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      )}

                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> Select a CHW from the dropdown and click "Sign In CHW" to start their workday.
            When they finish, click the "Sign Out" button next to their name. Points are calculated automatically (10 points per hour worked).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
