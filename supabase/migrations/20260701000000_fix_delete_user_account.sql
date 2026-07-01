CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_family_id TEXT;
  v_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the family_id and email before we delete the user
  SELECT family_id, email INTO v_family_id, v_email FROM parent_profiles WHERE user_id = v_user_id;

  IF v_family_id IS NOT NULL THEN
    -- Delete all child-related completions first to avoid foreign key constraint errors
    DELETE FROM completions WHERE child_id IN (SELECT id FROM children WHERE parent_id = v_family_id);
    
    -- Delete children
    DELETE FROM children WHERE parent_id = v_family_id;
    
    -- Delete tasks and rewards
    DELETE FROM tasks WHERE parent_id = v_family_id;
    DELETE FROM rewards WHERE parent_id = v_family_id;
    
    -- Delete other related items
    DELETE FROM reward_redemptions WHERE parent_id = v_family_id;
    
    -- Gifting requests use family_id
    DELETE FROM gifting_requests WHERE family_id = v_family_id;
    
    -- Family messages
    DELETE FROM family_messages WHERE family_id = v_family_id;
  END IF;

  -- Delete the user from auth.users. 
  -- Cascading deletes will automatically remove them from parent_profiles
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
