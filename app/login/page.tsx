'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Activity, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('afya_token', data.token);
      localStorage.setItem('afya_user', JSON.stringify(data.user));

      toast.success('Login successful');

      if (data.user.role === 'CHW') {
        router.push('/chw');
      } else if (data.user.role === 'SUPERVISOR') {
        router.push('/supervisor');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, role: string) => {
    setQuickLoginLoading(demoEmail);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'demo123' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('afya_token', data.token);
      localStorage.setItem('afya_user', JSON.stringify(data.user));

      toast.success(`Logged in as ${role}`);

      if (data.user.role === 'CHW') {
        router.push('/chw');
      } else if (data.user.role === 'SUPERVISOR') {
        router.push('/supervisor');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setQuickLoginLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-primary" strokeWidth={2.5} />
            <h1 className="text-4xl font-bold tracking-tight">AfyaUkweli</h1>
          </div>
          <p className="text-sm text-muted-foreground">Afya Yenye Ukweli</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ukweli wa Kazi za CHW
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@afya.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-3 font-semibold">
                Quick Demo Access
              </p>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => handleQuickLogin('akinyi.otieno@afya.ke', 'CHW')}
                  disabled={quickLoginLoading !== null || loading}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Community Health Worker</div>
                      <div className="text-xs text-muted-foreground">akinyi.otieno@afya.ke</div>
                    </div>
                  </div>
                  {quickLoginLoading === 'akinyi.otieno@afya.ke' ? (
                    <span className="text-xs">Logging in...</span>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => handleQuickLogin('mary.wekesa@afya.ke', 'Supervisor')}
                  disabled={quickLoginLoading !== null || loading}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Supervisor</div>
                      <div className="text-xs text-muted-foreground">mary.wekesa@afya.ke</div>
                    </div>
                  </div>
                  {quickLoginLoading === 'mary.wekesa@afya.ke' ? (
                    <span className="text-xs">Logging in...</span>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => handleQuickLogin('admin@afya.ke', 'Admin')}
                  disabled={quickLoginLoading !== null || loading}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Administrator</div>
                      <div className="text-xs text-muted-foreground">admin@afya.ke</div>
                    </div>
                  </div>
                  {quickLoginLoading === 'admin@afya.ke' ? (
                    <span className="text-xs">Logging in...</span>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Click any role to login instantly
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <span className="font-semibold">Hedera Hashgraph</span>
        </p>
      </div>
    </div>
  );
}
