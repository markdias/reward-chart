-- Add new point-based columns
ALTER TABLE parent_profiles 
  ADD COLUMN IF NOT EXISTS points_to_level_up INT DEFAULT 500,
  ADD COLUMN IF NOT EXISTS weekly_points_target INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS monthly_points_target INT DEFAULT 500;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS lifetime_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_gifting_date TIMESTAMPTZ;

-- Seed lifetime points with existing total points as a rough approximation
UPDATE children SET lifetime_points = COALESCE(points, 0);

-- Update default unlock levels to the new spaced out progression
UPDATE parent_profiles SET
  savings_pot_unlock_level = 2,
  food_pot_unlock_level = 4,
  gifting_pot_unlock_level = 6,
  maintenance_pot_unlock_level = 8,
  points_to_level_up = 500;

-- Drop deprecated XP and secondary pot columns
ALTER TABLE parent_profiles
  DROP COLUMN IF EXISTS xp_to_level_up,
  DROP COLUMN IF EXISTS savings_pot_unlock_xp,
  DROP COLUMN IF EXISTS food_pot_unlock_xp,
  DROP COLUMN IF EXISTS gifting_pot_unlock_xp,
  DROP COLUMN IF EXISTS maintenance_pot_unlock_xp,
  DROP COLUMN IF EXISTS weekly_xp_target,
  DROP COLUMN IF EXISTS monthly_xp_target;

ALTER TABLE children
  DROP COLUMN IF EXISTS xp_in_level,
  DROP COLUMN IF EXISTS weekly_xp,
  DROP COLUMN IF EXISTS monthly_xp,
  DROP COLUMN IF EXISTS food_pot,
  DROP COLUMN IF EXISTS gifting_pot,
  DROP COLUMN IF EXISTS maintenance_pot;

ALTER TABLE tasks
  DROP COLUMN IF EXISTS xp;

ALTER TABLE completions
  DROP COLUMN IF EXISTS xp_awarded;
