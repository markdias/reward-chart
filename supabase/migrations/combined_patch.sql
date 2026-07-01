-- Safe combined migration to ensure all new columns exist for the Maintenance Pot and Pots configuration

-- 1. Add configurable levels to parent_profiles
ALTER TABLE parent_profiles 
ADD COLUMN IF NOT EXISTS savings_pot_unlock_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS food_pot_unlock_level integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS food_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_level integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_level integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_xp integer DEFAULT 50;

-- 2. Add pots fields to children
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS savings_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS savings_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_pot_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gifting_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifting_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gifting_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_unlock_seen boolean DEFAULT false;

-- 3. Add damage tracking fields directly (instead of renaming old ones, just add the new ones)
ALTER TABLE children
ADD COLUMN IF NOT EXISTS main_last_maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS main_pot_damaged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS main_damage_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_rent_due BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rent_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS main_last_repair_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_maintenance_due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS next_pot_break_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 days');
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
