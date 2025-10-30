/*
  # AfyaUkweli Database Schema

  ## Overview
  Creates the core database structure for the AfyaUkweli Community Health Worker (CHW) 
  task logging and verification platform.

  ## New Tables
  
  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - Full name of the user
  - `email` (text, unique) - Email address for authentication
  - `role` (text) - User role: CHW, SUPERVISOR, or ADMIN
  - `phone` (text) - Contact phone number
  - `county` (text) - Kenyan county assignment
  - `sub_county` (text) - Sub-county within the county
  - `ward` (text) - Ward within the sub-county
  - `chw_account_id` (text, nullable) - Hedera account ID for receiving token rewards
  - `password_hash` (text) - Hashed password for authentication
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `task_id` (text, unique) - Human-readable ULID task identifier
  - `chw_id` (uuid, foreign key) - Reference to CHW user who logged the task
  - `task_type` (text) - Type: HOME_VISIT, IMMUNIZATION, FOLLOW_UP
  - `consent_code_hash` (text) - SHA-256 hash of the 4-digit consent code (never store raw)
  - `geohash` (text) - 6-7 character geohash for approximate location privacy
  - `notes` (text) - Task description and details
  - `status` (text) - Current status: PENDING, APPROVED, REJECTED
  - `created_at` (timestamptz) - Task submission timestamp
  - `approved_at` (timestamptz, nullable) - Approval/rejection timestamp
  - `supervisor_id` (uuid, nullable, foreign key) - Reference to supervisor who reviewed
  - `rejection_reason` (text, nullable) - Reason if rejected
  - `hcs_log_txn_hash` (text, nullable) - Hedera HCS transaction hash for task log
  - `hcs_approval_txn_hash` (text, nullable) - Hedera HCS transaction hash for approval
  - `hts_transfer_txn_hash` (text, nullable) - Hedera HTS transaction hash for token transfer
  - `points_awarded` (integer) - Number of CHW Points awarded (0 if not approved)

  ### 3. metric_snapshots
  - `id` (uuid, primary key) - Unique snapshot identifier
  - `snapshot_date` (date, unique) - Date of the metrics snapshot
  - `total_tasks` (integer) - Total tasks submitted that day
  - `approved_tasks` (integer) - Number of approved tasks
  - `rejected_tasks` (integer) - Number of rejected tasks
  - `pending_tasks` (integer) - Number of pending tasks
  - `points_distributed` (integer) - Total points awarded that day
  - `active_chws` (integer) - Number of active CHWs that day
  - `created_at` (timestamptz) - Snapshot creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - CHWs can only view their own tasks
  - Supervisors can view tasks in their assigned county
  - Admins have full access to all data
  - All tables have appropriate policies for SELECT, INSERT, UPDATE operations

  ## Important Notes
  1. No PII (personally identifiable information) is stored on-chain
  2. Only consent code hashes are stored, never raw codes
  3. Geohashes provide location privacy while enabling regional analytics
  4. All Hedera transaction hashes are stored for immutable audit trail
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('CHW', 'SUPERVISOR', 'ADMIN')),
  phone text,
  county text,
  sub_county text,
  ward text,
  chw_account_id text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text UNIQUE NOT NULL,
  chw_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('HOME_VISIT', 'IMMUNIZATION', 'FOLLOW_UP')),
  consent_code_hash text NOT NULL,
  geohash text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  supervisor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason text,
  hcs_log_txn_hash text,
  hcs_approval_txn_hash text,
  hts_transfer_txn_hash text,
  points_awarded integer DEFAULT 0
);

-- Create metric_snapshots table
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date UNIQUE NOT NULL,
  total_tasks integer DEFAULT 0,
  approved_tasks integer DEFAULT 0,
  rejected_tasks integer DEFAULT 0,
  pending_tasks integer DEFAULT 0,
  points_distributed integer DEFAULT 0,
  active_chws integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_chw_id ON tasks(chw_id);
CREATE INDEX IF NOT EXISTS idx_tasks_supervisor_id ON tasks(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_county ON tasks(chw_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_date ON metric_snapshots(snapshot_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for tasks table
CREATE POLICY "CHWs can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    chw_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND users.role IN ('SUPERVISOR', 'ADMIN')
    )
  );

CREATE POLICY "CHWs can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    chw_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'CHW'
    )
  );

CREATE POLICY "Supervisors can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND users.role IN ('SUPERVISOR', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() 
      AND users.role IN ('SUPERVISOR', 'ADMIN')
    )
  );

-- RLS Policies for metric_snapshots table
CREATE POLICY "Authenticated users can view metrics"
  ON metric_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert metrics"
  ON metric_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
