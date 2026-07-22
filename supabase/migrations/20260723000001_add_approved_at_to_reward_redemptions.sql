-- Add approved_at timestamp column to reward_redemptions table
ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
