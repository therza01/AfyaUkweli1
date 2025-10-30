import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { isSimpleMode } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isSimpleMode()) {
      const { computeStats } = await import('@/lib/simple-store');
      const stats = await computeStats();
      return NextResponse.json(stats);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: allTasks } = await supabase.from('tasks').select('*');
    const { data: todayTasks } = await supabase.from('tasks').select('*').gte('created_at', today.toISOString());
    const { data: last7DaysTasks } = await supabase.from('tasks').select('*').gte('created_at', sevenDaysAgo.toISOString());
    const { data: last30DaysTasks } = await supabase.from('tasks').select('*').gte('created_at', thirtyDaysAgo.toISOString());
    const { data: activeChws } = await supabase.from('users').select('id').eq('role', 'CHW');

    const approvedTasks = allTasks?.filter((t) => t.status === 'APPROVED') || [];
    const pendingTasks = allTasks?.filter((t) => t.status === 'PENDING') || [];
    const totalPoints24h = todayTasks?.reduce((sum, t) => sum + (t.points_awarded || 0), 0) || 0;
    const totalPoints7d = last7DaysTasks?.reduce((sum, t) => sum + (t.points_awarded || 0), 0) || 0;
    const approvalRate = allTasks && allTasks.length > 0 ? (approvedTasks.length / allTasks.length) * 100 : 0;
    const approvedTasksWithTime = approvedTasks.filter((t) => t.created_at && t.approved_at);
    const avgTimeToApproval =
      approvedTasksWithTime.length > 0
        ? approvedTasksWithTime.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const approved = new Date(t.approved_at!).getTime();
            return sum + (approved - created);
          }, 0) / approvedTasksWithTime.length
        : 0;
    const avgHours = avgTimeToApproval / (1000 * 60 * 60);

    const countyStats: Record<string, number> = {};
    for (const task of last30DaysTasks || []) {
      const { data: chw } = await supabase.from('users').select('county').eq('id', task.chw_id).maybeSingle();
      if (chw?.county) countyStats[chw.county] = (countyStats[chw.county] || 0) + 1;
    }

    const taskTypeDistribution = {
      HOME_VISIT: last30DaysTasks?.filter((t) => t.task_type === 'HOME_VISIT').length || 0,
      IMMUNIZATION: last30DaysTasks?.filter((t) => t.task_type === 'IMMUNIZATION').length || 0,
      FOLLOW_UP: last30DaysTasks?.filter((t) => t.task_type === 'FOLLOW_UP').length || 0,
    };

    const weekTrend: any[] = [];
    // Keep weekTrend empty in Supabase mode to avoid heavy queries; charts still render

    return NextResponse.json({
      kpis: {
        tasksToday: todayTasks?.length || 0,
        approvalRate: Math.round(approvalRate),
        pointsAwarded24h: totalPoints24h,
        pointsAwarded7d: totalPoints7d,
        activeChws: activeChws?.length || 0,
        avgTimeToApprovalHours: Math.round(avgHours * 10) / 10,
        pendingTasks: pendingTasks.length,
      },
      charts: {
        countyStats: Object.entries(countyStats).map(([county, count]) => ({ county, count })),
        taskTypeDistribution: [
          { type: 'Home Visit', value: taskTypeDistribution.HOME_VISIT },
          { type: 'Immunization', value: taskTypeDistribution.IMMUNIZATION },
          { type: 'Follow-up', value: taskTypeDistribution.FOLLOW_UP },
        ],
        weekTrend,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
