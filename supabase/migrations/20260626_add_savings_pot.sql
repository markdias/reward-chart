-- Add savings pot fields to the children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS savings_pot INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS savings_unlock_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS savings_goal_name TEXT,
ADD COLUMN IF NOT EXISTS savings_goal_amount INTEGER;
