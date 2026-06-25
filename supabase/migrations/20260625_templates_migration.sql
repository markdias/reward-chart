-- Migration: Add Directory Blueprints & Reward Rejection Support

-- 1. Add template tracking columns to Tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS child_id TEXT NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_id TEXT NULL REFERENCES tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS xp INTEGER NULL,
ADD COLUMN IF NOT EXISTS cooldown_minutes INTEGER NULL;

-- Update existing tasks to be templates so they show up in the directory
UPDATE tasks SET is_template = true, child_id = 'directory';

-- Drop old child_ids column since we transitioned to blueprint instances
ALTER TABLE tasks DROP COLUMN IF EXISTS child_ids;

-- 2. Add template tracking columns to Rewards
ALTER TABLE rewards
ADD COLUMN IF NOT EXISTS child_id TEXT NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_id TEXT NULL REFERENCES rewards(id) ON DELETE CASCADE;

-- Update existing rewards to be templates
UPDATE rewards SET is_template = true, child_id = 'directory';

-- Drop old child_ids column since we transitioned to blueprint instances
ALTER TABLE rewards DROP COLUMN IF EXISTS child_ids;

-- 3. Add missing columns to completions
ALTER TABLE completions
ADD COLUMN IF NOT EXISTS xp_awarded INTEGER NULL;

-- 4. Add 'rejected' to the reward_redemptions status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'redemption_status_new') THEN
    CREATE TYPE redemption_status_new AS ENUM ('requested', 'delivered', 'rejected');
  END IF;
END$$;

ALTER TABLE reward_redemptions 
  ALTER COLUMN status TYPE redemption_status_new 
  USING status::text::redemption_status_new;

DROP TYPE IF EXISTS redemption_status;
ALTER TYPE redemption_status_new RENAME TO redemption_status;
