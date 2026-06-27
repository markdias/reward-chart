-- Move configurations to global settings (parent_profiles)

-- Drop from children if they were added
ALTER TABLE children
DROP COLUMN IF EXISTS xp_to_level_up,
DROP COLUMN IF EXISTS savings_pot_unlock_level,
DROP COLUMN IF EXISTS savings_pot_unlock_xp,
DROP COLUMN IF EXISTS food_pot_unlock_level,
DROP COLUMN IF EXISTS food_pot_unlock_xp,
DROP COLUMN IF EXISTS gifting_pot_unlock_level,
DROP COLUMN IF EXISTS gifting_pot_unlock_xp,
DROP COLUMN IF EXISTS weekly_xp_target,
DROP COLUMN IF EXISTS weekly_reward_points,
DROP COLUMN IF EXISTS monthly_xp_target,
DROP COLUMN IF EXISTS monthly_reward_points,
DROP COLUMN IF EXISTS level_up_gold_reward;

-- Add to parent_profiles
ALTER TABLE parent_profiles
ADD COLUMN IF NOT EXISTS level_up_gold_reward integer DEFAULT 500,
ADD COLUMN IF NOT EXISTS xp_to_level_up integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS food_pot_unlock_level integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS food_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_level integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS weekly_xp_target integer DEFAULT 300,
ADD COLUMN IF NOT EXISTS weekly_reward_points integer DEFAULT 200,
ADD COLUMN IF NOT EXISTS monthly_xp_target integer DEFAULT 1000,
ADD COLUMN IF NOT EXISTS monthly_reward_points integer DEFAULT 1000;
