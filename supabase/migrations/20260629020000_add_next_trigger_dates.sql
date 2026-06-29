-- Add next trigger dates to children
ALTER TABLE children
ADD COLUMN IF NOT EXISTS next_maintenance_due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS next_pot_break_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 days');

-- Backfill existing kids
UPDATE children
SET 
  next_maintenance_due_date = COALESCE(main_last_maintenance_date + INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '30 days'),
  next_pot_break_date = COALESCE(main_last_repair_date + INTERVAL '10 days', CURRENT_TIMESTAMP + INTERVAL '10 days')
WHERE next_maintenance_due_date IS NULL OR next_pot_break_date IS NULL;
