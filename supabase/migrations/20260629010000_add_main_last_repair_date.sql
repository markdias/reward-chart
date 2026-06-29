-- Add main_last_repair_date column to children to track the 10-day broken pot cycle
ALTER TABLE children
ADD COLUMN IF NOT EXISTS main_last_repair_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing kids
UPDATE children
SET main_last_repair_date = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE main_last_repair_date IS NULL;
