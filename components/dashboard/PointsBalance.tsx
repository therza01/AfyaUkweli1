'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsBalanceProps {
  userId: string;
}

export function PointsBalance({ userId }: PointsBalanceProps) {
  const [points, setPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [isBlurred, setIsBlurred] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('points_blur') === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, [userId]);

  const loadPoints = async () => {
    try {
      const token = localStorage.getItem('afya_token');
      const response = await fetch('/api/task?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      const userTasks = data.tasks?.filter((t: any) => t.chw_id === userId && t.status === 'APPROVED') || [];
      const totalPoints = userTasks.reduce((sum: number, task: any) => sum + (task.points_awarded || 0), 0);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyTaskPoints = userTasks
        .filter((t: any) => new Date(t.approved_at) >= oneWeekAgo)
        .reduce((sum: number, task: any) => sum + (task.points_awarded || 0), 0);

      setPoints(totalPoints);
      setWeeklyPoints(weeklyTaskPoints);
    } catch (error) {
      console.error('Failed to load points:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlur = () => {
    const newBlurState = !isBlurred;
    setIsBlurred(newBlurState);
    localStorage.setItem('points_blur', newBlurState.toString());
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">CHW Points Balance</CardTitle>
              <CardDescription>CHWP Token Holdings</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleBlur}
            className="flex-shrink-0"
          >
            {isBlurred ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <p className={cn(
                'text-5xl font-bold transition-all duration-300',
                isBlurred && 'blur-xl select-none'
              )}>
                {loading ? '...' : points.toLocaleString()}
              </p>
              <span className="text-lg text-muted-foreground">CHWP</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <p className={cn(
                'text-2xl font-bold transition-all duration-300',
                isBlurred && 'blur-lg select-none'
              )}>
                +{loading ? '...' : weeklyPoints}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Per Task</span>
              </div>
              <p className="text-2xl font-bold">10-15</p>
            </div>
          </div>

          {isBlurred && (
            <p className="text-xs text-center text-muted-foreground">
              Click the eye icon to show your balance
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
