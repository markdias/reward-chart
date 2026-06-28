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
ADD COLUMN IF NOT EXISTS main_damage_date TIMESTAMP WITH TIME ZONE;
