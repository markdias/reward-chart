-- Add age column to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS age INTEGER;
