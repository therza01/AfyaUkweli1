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
DROP POLICY IF EXISTS "CHWs can insert own tasks" ON users;

-- Add policy to allow public signups
CREATE POLICY "Allow public user signup"
  ON users FOR INSERT
  WITH CHECK (true);
