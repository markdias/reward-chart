-- 1. Add Maintenance Pot config to parent_profiles
ALTER TABLE parent_profiles 
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_level integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_xp integer DEFAULT 50;

-- 2. Rename Savings Pot maintenance fields to apply to Main Money
ALTER TABLE children 
RENAME COLUMN savings_last_maintenance_date TO main_last_maintenance_date;

ALTER TABLE children 
RENAME COLUMN savings_pot_damaged TO main_pot_damaged;

ALTER TABLE children 
RENAME COLUMN savings_damage_date TO main_damage_date;

-- 3. Add the Maintenance Pot fields to children
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS maintenance_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_unlock_seen boolean DEFAULT false;
