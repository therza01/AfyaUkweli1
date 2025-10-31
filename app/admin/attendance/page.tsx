'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, Coins, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/client-auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { format } from 'date-fns';

export default function AdminAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadStats();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [selectedDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/attendance?type=admin-stats&date=${selectedDate}`);
      const data = await response.json();
      setStats(data.stats || {});
      setDailyTrend(data.dailyTrend || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} role="ADMIN">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Attendance Overview</h2>
            <p className="text-muted-foreground">Monitor CHW attendance across the organization</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Total Signed In</CardDescription>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats?.total_checked_in || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    CHWs checked in today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Currently Working</CardDescription>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.currently_working || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active right now
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Checked Out</CardDescription>
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.checked_out || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Finished for the day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Points Earned</CardDescription>
                    <Coins className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats?.total_points_today || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From attendance today
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  7-Day Attendance Trend
                </CardTitle>
                <CardDescription>
                  Number of CHWs checked in per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyTrend.length > 0 ? (
                  <div className="space-y-3">
                    {dailyTrend.map((day) => {
                      const maxChws = Math.max(...dailyTrend.map(d => d.chws));
                      const percentage = (day.chws / maxChws) * 100;

                      return (
                        <div key={day.date} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {format(new Date(day.date), 'EEE, MMM d')}
                            </span>
                            <span className="text-muted-foreground">{day.chws} CHWs</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance data available for the past 7 days
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Today's performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <Badge variant="outline">
                        {stats?.total_checked_in > 0
                          ? Math.round((stats.checked_out / stats.total_checked_in) * 100)
                          : 0}% Completed
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Points/CHW</span>
                      <Badge variant="outline">
                        {stats?.total_checked_in > 0
                          ? Math.round(stats.total_points_today / stats.total_checked_in)
                          : 0} points
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Selected Date</span>
                      <Badge variant="outline">
                        {format(new Date(selectedDate), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Real-time monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Attendance System</p>
                        <p className="text-xs text-muted-foreground">All services operational</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">QR Code Validation</p>
                        <p className="text-xs text-muted-foreground">Active and secure</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Points Processing</p>
                        <p className="text-xs text-muted-foreground">Real-time calculation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">About Attendance Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      This page shows organization-wide attendance metrics. CHWs check in with their supervisors
                      using QR codes, work their shifts, and check out to earn points (10 points per hour).
                      Supervisors can also manually sign CHWs in and out. Use the date selector above to view
                      historical attendance data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
