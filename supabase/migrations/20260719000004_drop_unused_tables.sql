-- Migration: Drop unused family_messages table
DROP TABLE IF EXISTS family_messages CASCADE;

-- Update delete_user_account function to remove the reference to family_messages
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_family_id TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT family_id INTO v_family_id FROM parent_profiles WHERE user_id = v_user_id;

  IF v_family_id IS NOT NULL THEN
    DELETE FROM completions
      WHERE child_id IN (SELECT id FROM children WHERE parent_id = v_family_id);
    DELETE FROM children           WHERE parent_id  = v_family_id;
    DELETE FROM tasks              WHERE parent_id  = v_family_id;
    DELETE FROM rewards            WHERE parent_id  = v_family_id;
    DELETE FROM reward_redemptions WHERE parent_id  = v_family_id;
    DELETE FROM gifting_requests   WHERE family_id  = v_family_id;
  END IF;

  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
