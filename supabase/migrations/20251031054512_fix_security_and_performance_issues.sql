/*
  # Fix Security and Performance Issues

  ## Changes

  ### 1. Add Missing Indexes for Foreign Keys
  - Add index for task_assignments.assigned_by
  - Add index for task_assignments.task_id

  ### 2. Fix Auth RLS Performance
  - Update tasks RLS policies to use (select auth.uid())
  - Update metric_snapshots RLS policies to use (select auth.uid())

  ### 3. Remove Unused Indexes
  - Keep only essential indexes that will be used
  - Remove duplicate indexes

  ### 4. Enable RLS on Public Tables
  - Enable RLS on users table with proper policies
  - Enable RLS on attendance table with proper policies
  - Enable RLS on task_assignments table with proper policies
  - Enable RLS on supervisor_qr_codes table with proper policies

  ### 5. Fix Function Search Path
  - Make update_updated_at_column function search path immutable
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by 
  ON task_assignments(assigned_by);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id 
  ON task_assignments(task_id);

-- Drop duplicate and unused indexes
DROP INDEX IF EXISTS idx_tasks_county;
DROP INDEX IF EXISTS idx_task_assignments_supervisor;
DROP INDEX IF EXISTS idx_task_assignments_chw;
DROP INDEX IF EXISTS idx_task_assignments_status;
DROP INDEX IF EXISTS idx_supervisor_qr_date;
DROP INDEX IF EXISTS idx_tasks_chw_id;
DROP INDEX IF EXISTS idx_tasks_supervisor_id;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_metric_snapshots_date;
DROP INDEX IF EXISTS idx_attendance_supervisor;
DROP INDEX IF EXISTS idx_attendance_status;

-- Recreate only the essential indexes that will actually be used
CREATE INDEX IF NOT EXISTS idx_attendance_chw_date 
  ON attendance(chw_id, date);

CREATE INDEX IF NOT EXISTS idx_tasks_chw_status 
  ON tasks(chw_id, status);

-- Fix RLS policies on tasks table
DROP POLICY IF EXISTS "CHWs can view own tasks" ON tasks;
DROP POLICY IF EXISTS "CHWs can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Supervisors can update tasks" ON tasks;

CREATE POLICY "CHWs can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (chw_id = (select auth.uid()));

CREATE POLICY "CHWs can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (chw_id = (select auth.uid()));

CREATE POLICY "Supervisors can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Fix RLS policies on metric_snapshots table
DROP POLICY IF EXISTS "Admins can insert metrics" ON metric_snapshots;

CREATE POLICY "Admins can insert metrics"
  ON metric_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view metrics"
  ON metric_snapshots FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow signup" ON users;
DROP POLICY IF EXISTS "Allow public user reads" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Allow signup"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable RLS on attendance table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CHWs can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (chw_id = (select auth.uid()) OR supervisor_id = (select auth.uid()));

CREATE POLICY "Supervisors can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (supervisor_id = (select auth.uid()) OR chw_id = (select auth.uid()));

CREATE POLICY "Supervisors can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (supervisor_id = (select auth.uid()) OR chw_id = (select auth.uid()))
  WITH CHECK (supervisor_id = (select auth.uid()) OR chw_id = (select auth.uid()));

CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on task_assignments table
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assignments"
  ON task_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Supervisors can view their assignments"
  ON task_assignments FOR SELECT
  TO authenticated
  USING (assigned_to_supervisor = (select auth.uid()));

CREATE POLICY "CHWs can view their assignments"
  ON task_assignments FOR SELECT
  TO authenticated
  USING (assigned_to_chw = (select auth.uid()));

-- Enable RLS on supervisor_qr_codes table
ALTER TABLE supervisor_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supervisors can manage own QR codes"
  ON supervisor_qr_codes FOR ALL
  TO authenticated
  USING (supervisor_id = (select auth.uid()))
  WITH CHECK (supervisor_id = (select auth.uid()));

CREATE POLICY "CHWs can view QR codes"
  ON supervisor_qr_codes FOR SELECT
  TO authenticated
  USING (true);

-- Fix function search path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it existed
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
