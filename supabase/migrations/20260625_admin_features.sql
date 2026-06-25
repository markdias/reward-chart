-- Migration: Parent Profiles, PIN Storage, and Account Management

-- 1. Create parent_profiles table to store PIN and Family ID
CREATE TABLE IF NOT EXISTS parent_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  family_id TEXT NOT NULL,
  pin TEXT DEFAULT '0000',
  share_token TEXT UNIQUE
);

-- Note: We must ensure that RLS policies allow reading/writing to parent_profiles
-- However, since this is a client-heavy app, we will just allow public access for simplicity,
-- or authenticated access only if preferred.
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read parent_profiles" ON parent_profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update parent_profiles" ON parent_profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert parent_profiles" ON parent_profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. Create RPC function for deleting a user account
-- This function needs SECURITY DEFINER to bypass RLS and delete from auth.users
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users. 
  -- Cascading deletes will automatically remove them from parent_profiles
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
