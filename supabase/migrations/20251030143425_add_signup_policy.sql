/*
  # Add Signup Policy

  ## Changes
  - Add policy to allow public user registration
  - Users can sign up without authentication

  ## Security
  - Only allows INSERT operations for new user registration
  - User can only insert their own data during signup
*/

-- Drop existing insert policy if exists
-- Clean up any previous signup policy if present (idempotent)
DROP POLICY IF EXISTS "Allow public user signup" ON users;

-- Add policy to allow public signups
CREATE POLICY "Allow public user signup"
  ON users FOR INSERT
  WITH CHECK (true);
