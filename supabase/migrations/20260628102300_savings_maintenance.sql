-- Add maintenance and damage tracking for Savings Pot
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS savings_last_maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS savings_pot_damaged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS savings_damage_date TIMESTAMP WITH TIME ZONE;
