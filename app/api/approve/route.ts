import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { submitApprovalLog, transferPoints, getHashScanUrl } from '@/lib/hedera';
import { z } from 'zod';
import { isSimpleMode } from '@/lib/config';
import { getTaskById as storeGetTaskById, updateTask as storeUpdateTask } from '@/lib/simple-store';

export const dynamic = 'force-dynamic';

const approvalSchema = z.object({
  taskId: z.string(),
  approved: z.boolean(),
  reason: z.string().optional(),
});

const POINTS_MAP = {
  HOME_VISIT: 10,
  IMMUNIZATION: 15,
  FOLLOW_UP: 12,
};

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !['SUPERVISOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Supervisor or Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { taskId, approved, reason } = approvalSchema.parse(body);

    let task: any = null;
    if (isSimpleMode()) {
      const t = await storeGetTaskById(taskId);
      if (!t) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      task = { ...t, chw: { chw_account_id: null } };
    } else {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*, chw:users!tasks_chw_id_fkey(chw_account_id)')
        .eq('id', taskId)
        .maybeSingle();
      if (fetchError || !data) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      task = data;
    }

    if (task.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Task already processed' },
        { status: 400 }
      );
    }

    const approvalPayload = {
      type: 'TASK_APPROVAL' as const,
      taskId: task.task_id,
      supervisorId: user.id,
      approved,
      when: Date.now(),
    };

    const hcsResult = await submitApprovalLog(approvalPayload);

    let htsTransferHash = null;
    let pointsAwarded = 0;

    if (approved && task.chw?.chw_account_id) {
      pointsAwarded = POINTS_MAP[task.task_type as keyof typeof POINTS_MAP] || 10;

      try {
        const transferResult = await transferPoints(
          task.chw.chw_account_id,
          pointsAwarded
        );
        htsTransferHash = transferResult.txHashHex;
      } catch (error) {
        console.error('Token transfer failed:', error);
      }
    }

    let updatedTask: any = null;
    if (isSimpleMode()) {
      updatedTask = await storeUpdateTask(taskId, {
        status: approved ? 'APPROVED' : 'REJECTED',
        approved_at: new Date().toISOString() as any,
        supervisor_id: user.id,
        rejection_reason: !approved ? (reason as any) : (null as any),
        hcs_approval_txn_hash: hcsResult.txHashHex as any,
        hts_transfer_txn_hash: (htsTransferHash as any) || null,
        points_awarded: pointsAwarded as any,
      } as any);
    } else {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          status: approved ? 'APPROVED' : 'REJECTED',
          approved_at: new Date().toISOString(),
          supervisor_id: user.id,
          rejection_reason: !approved ? reason : null,
          hcs_approval_txn_hash: hcsResult.txHashHex,
          hts_transfer_txn_hash: htsTransferHash,
          points_awarded: pointsAwarded,
        })
        .eq('id', taskId)
        .select()
        .single();
      if (updateError) throw updateError;
      updatedTask = data;
    }

    return NextResponse.json({
      task: updatedTask,
      hcsApprovalHash: hcsResult.txHashHex,
      htsTransferHash,
      pointsAwarded,
      hashScanUrls: {
        approval: getHashScanUrl('transaction', hcsResult.txHashHex),
        transfer: htsTransferHash ? getHashScanUrl('transaction', htsTransferHash) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}
