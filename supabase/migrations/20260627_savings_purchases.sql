-- Add support for selecting a specific reward as a savings goal
ALTER TABLE children
ADD COLUMN IF NOT EXISTS savings_goal_reward_id TEXT;

-- Add support for purchasing a reward using the savings pot
ALTER TABLE reward_redemptions
ADD COLUMN IF NOT EXISTS payment_source TEXT DEFAULT 'main';
