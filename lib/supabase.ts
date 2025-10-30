import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'CHW' | 'SUPERVISOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  county?: string;
  sub_county?: string;
  ward?: string;
  chw_account_id?: string;
  created_at: string;
  updated_at: string;
}

export type TaskType = 'HOME_VISIT' | 'IMMUNIZATION' | 'FOLLOW_UP';
export type TaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: string;
  task_id: string;
  chw_id: string;
  task_type: TaskType;
  consent_code_hash: string;
  geohash: string;
  notes?: string;
  status: TaskStatus;
  created_at: string;
  approved_at?: string;
  supervisor_id?: string;
  rejection_reason?: string;
  hcs_log_txn_hash?: string;
  hcs_approval_txn_hash?: string;
  hts_transfer_txn_hash?: string;
  points_awarded: number;
}

export interface MetricSnapshot {
  id: string;
  snapshot_date: string;
  total_tasks: number;
  approved_tasks: number;
  rejected_tasks: number;
  pending_tasks: number;
  points_distributed: number;
  active_chws: number;
  created_at: string;
}
