-- Migration to add configurable levels and pot unlock thresholds to children table

ALTER TABLE children 
ADD COLUMN IF NOT EXISTS xp_to_level_up integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS food_pot_unlock_level integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS food_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_level integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_xp integer DEFAULT 50;
