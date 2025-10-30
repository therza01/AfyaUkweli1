'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
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
              <p className="text-xs text-muted-foreground text-center mb-3">
                Demo accounts (password: demo123)
              </p>
              <div className="grid gap-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">CHW:</span>
                  <span className="font-mono">akinyi.otieno@afya.ke</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">Supervisor:</span>
                  <span className="font-mono">mary.wekesa@afya.ke</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                  <span className="text-muted-foreground">Admin:</span>
                  <span className="font-mono">admin@afya.ke</span>
                </div>
              </div>
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
