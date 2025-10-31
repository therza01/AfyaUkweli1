'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Activity,
  LogOut,
  Home,
  CheckSquare,
  BarChart3,
  Users,
  Menu,
  X,
  Coins,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
  role: 'CHW' | 'SUPERVISOR' | 'ADMIN';
}

const navigationConfig = {
  CHW: [
    { href: '/chw', label: 'Dashboard', icon: Home },
    { href: '/chw/attendance', label: 'Attendance', icon: Clock },
  ],
  SUPERVISOR: [
    { href: '/supervisor', label: 'Approvals', icon: CheckSquare },
    { href: '/supervisor/attendance', label: 'Attendance', icon: Clock },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/attendance', label: 'Attendance', icon: Users },
  ],
};

export function DashboardLayout({ children, user, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = navigationConfig[role];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('afya_token');
      localStorage.removeItem('afya_user');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <Activity className="w-7 h-7 text-primary" strokeWidth={2.5} />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">AfyaUkweli</h1>
                <p className="text-xs text-muted-foreground">{role} Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.county || role}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card/50 min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-secondary/80 text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Powered by Hedera
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Blockchain-verified tasks
              </p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-16 bottom-0 w-64 bg-card border-r border-border shadow-xl">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-secondary/80 text-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
