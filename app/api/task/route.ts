import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hashConsentCode } from '@/lib/auth';
// Hedera helpers are dynamically imported in the handler to avoid build-time bundling issues
import { ulid } from 'ulid';
import { z } from 'zod';
import { isSimpleMode } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const taskSchema = z.object({
  taskType: z.enum(['HOME_VISIT', 'IMMUNIZATION', 'FOLLOW_UP']),
  consentCode: z.string().length(4),
  geohash: z.string().min(6).max(7),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== 'CHW') {
      return NextResponse.json(
        { error: 'Unauthorized. CHW access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { taskType, consentCode, geohash, notes } = taskSchema.parse(body);

    const consentHash = hashConsentCode(consentCode);
    const taskId = ulid();

    const taskPayload = {
      type: 'TASK_LOG' as const,
      taskId,
      chwId: user.id,
      taskType,
      geohash,
      consentHash,
      when: Date.now(),
    };

    const { submitTaskLog, getHashScanUrl } = await import('@/lib/hedera');
    const hcsResult = await submitTaskLog(taskPayload);

    if (isSimpleMode()) {
      const { insertTask } = await import('@/lib/simple-store');
      const task = await insertTask({
        task_id: taskId,
        chw_id: user.id,
        task_type: taskType,
        consent_code_hash: consentHash,
        geohash,
        notes,
        status: 'PENDING',
        hcs_log_txn_hash: hcsResult.txHashHex,
        hcs_approval_txn_hash: null as any,
        hts_transfer_txn_hash: null as any,
        points_awarded: 0,
        supervisor_id: null as any,
      } as any);
      return NextResponse.json({
        task,
        hcsTransactionHash: hcsResult.txHashHex,
        hashScanUrl: getHashScanUrl('transaction', hcsResult.txHashHex),
      });
    } else {
      const { supabase } = await import('@/lib/supabase');
      const { data: task, error: insertError } = await supabase
        .from('tasks')
        .insert({
          task_id: taskId,
          chw_id: user.id,
          task_type: taskType,
          consent_code_hash: consentHash,
          geohash,
          notes,
          status: 'PENDING',
          hcs_log_txn_hash: hcsResult.txHashHex,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({
        task,
        hcsTransactionHash: hcsResult.txHashHex,
        hashScanUrl: getHashScanUrl('transaction', hcsResult.txHashHex),
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Task submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (isSimpleMode()) {
      const { fetchTasks } = await import('@/lib/simple-store');
      const { data, count } = await fetchTasks({ user, status, page, limit });
      return NextResponse.json({
        tasks: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } else {
      let query: any;
    if (user.role === 'SUPERVISOR' && user.county) {
      const { supabase } = await import('@/lib/supabase');
      query = supabase
        .from('tasks')
        .select('*, chw:users!inner(name, email, county)', { count: 'exact' })
        .eq('users.county', user.county);
    } else {
      const { supabase } = await import('@/lib/supabase');
      query = supabase
        .from('tasks')
        .select('*, chw:users!tasks_chw_id_fkey(name, email, county)', { count: 'exact' });
      if (user.role === 'CHW') {
        query = query.eq('chw_id', user.id);
      }
    }
      if (status) query = query.eq('status', status);
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      const { data, error, count } = await query;
      if (error) throw error;
      return NextResponse.json({
        tasks: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }
  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
