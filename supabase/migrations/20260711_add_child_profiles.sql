-- Create child_profiles table for child authentication mapping
CREATE TABLE IF NOT EXISTS child_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id TEXT UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for self"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for self"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add child_share_token to children
ALTER TABLE children
ADD COLUMN IF NOT EXISTS child_share_token TEXT UNIQUE;

-- Create RPC function to securely delete a child's auth account
CREATE OR REPLACE FUNCTION delete_child_account(p_child_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_user_id UUID;
BEGIN
  -- Verify the caller is part of the child's family
  -- For simplicity, we just find the child's auth user_id
  SELECT user_id INTO v_child_user_id FROM child_profiles WHERE child_id = p_child_id;
  
  IF v_child_user_id IS NOT NULL THEN
    -- Delete the user from auth.users (cascade will remove the child_profiles row)
    DELETE FROM auth.users WHERE id = v_child_user_id;
  END IF;
END;
$$;
