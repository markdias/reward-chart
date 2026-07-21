-- Add holiday_mode column to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS holiday_mode BOOLEAN DEFAULT false;
