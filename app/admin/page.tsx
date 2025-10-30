'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Activity,
  LogOut,
  TrendingUp,
  Users,
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
  CheckCircle,
  Clock,
  Coins,
  BarChart3,
  Loader2,
  ExternalLink,
  Download,
} from 'lucide-react';
import { getUser, logout, fetchWithAuth } from '@/lib/client-auth';
import { KPICard } from '@/components/dashboard/KPICard';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetchWithAuth('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    toast.success('CSV export feature coming soon');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </DashboardLayout>
    );
  }

  const topicId = process.env.NEXT_PUBLIC_HCS_TOPIC_ID || '0.0.xxxxx';
  const tokenId = process.env.NEXT_PUBLIC_HTS_TOKEN_ID || '0.0.yyyyy';

  const exportCSV = () => {
    toast.success('CSV export feature coming soon');
  };

  return (
    <DashboardLayout user={user} role="ADMIN">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time insights into CHW activities and performance
          </p>
        </DashboardLayout>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Tasks Today"
            value={stats?.kpis.tasksToday || 0}
            subtitle="24h activity"
            icon={Activity}
          />
          <KPICard
            title="Approval Rate"
            value={`${stats?.kpis.approvalRate || 0}%`}
            subtitle="All time"
            icon={CheckCircle}
          />
          <KPICard
            title="Points (24h)"
            value={stats?.kpis.pointsAwarded24h || 0}
            subtitle={`${stats?.kpis.pointsAwarded7d || 0} this week`}
            icon={Coins}
          />
          <KPICard
            title="Active CHWs"
            value={stats?.kpis.activeChws || 0}
            subtitle="Total registered"
            icon={Users}
          />
        </DashboardLayout>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tasks by County (30 days)
              </CardTitle>
              <CardDescription>Regional distribution of activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.charts.countyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="county" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                7-Day Trend
              </CardTitle>
              <CardDescription>Tasks and approvals over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.charts.weekTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="approved" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </DashboardLayout>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Task Type Distribution</CardTitle>
              <CardDescription>Last 30 days breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats?.charts.taskTypeDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.type}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats?.charts.taskTypeDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>System performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pending Tasks</span>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </DashboardLayout>
                  <p className="text-2xl font-bold">{stats?.kpis.pendingTasks || 0}</p>
                </DashboardLayout>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Avg Approval Time</span>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </DashboardLayout>
                  <p className="text-2xl font-bold">{stats?.kpis.avgTimeToApprovalHours || 0}h</p>
                </DashboardLayout>
              </DashboardLayout>
            </CardContent>
          </Card>
        </DashboardLayout>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hedera Consensus Service
                <Badge variant="outline" className="ml-auto">Testnet</Badge>
              </CardTitle>
              <CardDescription>Immutable task logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Topic ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm font-mono bg-background/50 px-3 py-2 rounded">
                    {topicId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_HASHSCAN_BASE}/topic/${topicId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </DashboardLayout>
              </DashboardLayout>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hedera Token Service
                <Badge variant="outline" className="ml-auto">CHWP</Badge>
              </CardTitle>
              <CardDescription>CHW Points token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Token ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm font-mono bg-background/50 px-3 py-2 rounded">
                    {tokenId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_HASHSCAN_BASE}/token/${tokenId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </DashboardLayout>
              </DashboardLayout>
            </CardContent>
          </Card>
        </DashboardLayout>
      </DashboardLayout>
    </DashboardLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
