-- Safe combined migration to ensure all new columns exist for the Maintenance Pot and Pots configuration

-- 1. Add configurable levels to parent_profiles
ALTER TABLE parent_profiles 
ADD COLUMN IF NOT EXISTS daily_points_target integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS savings_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS food_pot_unlock_level integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS food_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_level integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS gifting_pot_unlock_xp integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_level integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS maintenance_pot_unlock_xp integer DEFAULT 50;

-- 2. Add pots fields to children
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS has_pending_nudge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_nudge_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS savings_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_saved_date text,
ADD COLUMN IF NOT EXISTS savings_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS savings_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_pot_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gifting_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifting_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gifting_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_pot integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS holiday_mode boolean DEFAULT false;

-- 3. Add damage tracking fields directly (instead of renaming old ones, just add the new ones)
ALTER TABLE children
ADD COLUMN IF NOT EXISTS main_last_maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS main_pot_damaged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS main_damage_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_rent_due BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rent_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS main_last_repair_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_maintenance_due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS next_pot_break_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 days');
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_family_id TEXT;
  v_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the family_id and email before we delete the user
  SELECT family_id, email INTO v_family_id, v_email FROM parent_profiles WHERE user_id = v_user_id;

  IF v_family_id IS NOT NULL THEN
    -- Delete all child-related completions first to avoid foreign key constraint errors
    DELETE FROM completions WHERE child_id IN (SELECT id FROM children WHERE parent_id = v_family_id);
    
    -- Delete children
    DELETE FROM children WHERE parent_id = v_family_id;
    
    -- Delete tasks and rewards
    DELETE FROM tasks WHERE parent_id = v_family_id;
    DELETE FROM rewards WHERE parent_id = v_family_id;
    
    -- Delete other related items
    DELETE FROM reward_redemptions WHERE parent_id = v_family_id;
    
    -- Gifting requests use family_id
    DELETE FROM gifting_requests WHERE family_id = v_family_id;
    
    -- Family messages
    DELETE FROM family_messages WHERE family_id = v_family_id;
  END IF;

  -- Delete the user from auth.users. 
  -- Cascading deletes will automatically remove them from parent_profiles
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- 4. Add Gold Pot Maintenance Fields
ALTER TABLE children
ADD COLUMN IF NOT EXISTS gold_pot_maintenance_unlock_seen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gold_pot_broken boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gold_pot_break_count_this_week integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_pot_break_week text,
ADD COLUMN IF NOT EXISTS gold_pot_last_check_date text,
ADD COLUMN IF NOT EXISTS gold_pot_last_leak_date text,
ADD COLUMN IF NOT EXISTS gold_pot_last_fix_date text,
ADD COLUMN IF NOT EXISTS gold_pot_total_leaked integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_pot_intro_seen boolean DEFAULT false;

ALTER TABLE parent_profiles
ADD COLUMN IF NOT EXISTS gold_pot_maintenance_unlock_level integer DEFAULT 8,
ADD COLUMN IF NOT EXISTS gold_pot_maintenance_cost integer DEFAULT 2;

-- Add dashboard_style to parent_profiles
ALTER TABLE parent_profiles 
ADD COLUMN IF NOT EXISTS dashboard_style text DEFAULT 'modern' NOT NULL;
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unlock_condition_hint TEXT
);

CREATE TABLE IF NOT EXISTS child_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(child_id, badge_id)
);

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_badge_eligible BOOLEAN DEFAULT false;

-- Badges RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select for badges" ON badges;
CREATE POLICY "Allow public select for badges" ON badges
FOR SELECT USING (true);

-- Child Badges RLS
ALTER TABLE child_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for child_badges" ON child_badges;
CREATE POLICY "Allow public select for child_badges" ON child_badges
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert for child_badges" ON child_badges;
CREATE POLICY "Allow public insert for child_badges" ON child_badges
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update for child_badges" ON child_badges;
CREATE POLICY "Allow public update for child_badges" ON child_badges
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete for child_badges" ON child_badges;
CREATE POLICY "Allow public delete for child_badges" ON child_badges
FOR DELETE USING (true);

-- Insert the 50 Badges
INSERT INTO badges (id, name, description, icon_name, category, unlock_condition_hint) VALUES
-- Coins & Wealth
('first-coin', 'First Coin', 'Earn your first coin.', 'CircleDollarSign', 'coins', 'points > 0'),
('pocket-money', 'Pocket Money', 'Reach 50 lifetime coins.', 'Wallet', 'coins', 'lifetime_points >= 50'),
('coin-collector', 'Coin Collector', 'Reach 100 lifetime coins.', 'Coins', 'coins', 'lifetime_points >= 100'),
('piggy-bank-full', 'Piggy Bank Full', 'Reach 250 lifetime coins.', 'PiggyBank', 'coins', 'lifetime_points >= 250'),
('treasure-hunter', 'Treasure Hunter', 'Reach 500 lifetime coins.', 'Map', 'coins', 'lifetime_points >= 500'),
('rich-king', 'Rich as a King', 'Reach 1,000 lifetime coins.', 'Crown', 'coins', 'lifetime_points >= 1000'),
('gold-miner', 'Gold Miner', 'Reach 2,500 lifetime coins.', 'Pickaxe', 'coins', 'lifetime_points >= 2500'),
('dragons-hoard', 'Dragon''s Hoard', 'Reach 5,000 lifetime coins.', 'Gem', 'coins', 'lifetime_points >= 5000'),

-- Level Progression
('rising-star', 'Rising Star', 'Reach Level 2.', 'Star', 'levels', 'level >= 2'),
('getting-hang', 'Getting the Hang of It', 'Reach Level 3.', 'ThumbsUp', 'levels', 'level >= 3'),
('on-the-move', 'On the Move', 'Reach Level 5.', 'TrendingUp', 'levels', 'level >= 5'),
('high-flyer', 'High Flyer', 'Reach Level 10.', 'Rocket', 'levels', 'level >= 10'),
('seasoned-pro', 'Seasoned Pro', 'Reach Level 15.', 'Medal', 'levels', 'level >= 15'),
('master-house', 'Master of the House', 'Reach Level 20.', 'Key', 'levels', 'level >= 20'),
('expert-status', 'Expert Status', 'Reach Level 30.', 'Award', 'levels', 'level >= 30'),
('legendary', 'Legendary', 'Reach Level 50.', 'Trophy', 'levels', 'level >= 50'),

-- Streaks & Consistency
('just-getting-started', 'Just Getting Started', '2-day activity streak.', 'Zap', 'streaks', 'streak_days >= 2'),
('threes-charm', 'Three''s a Charm', '3-day activity streak.', 'Sparkles', 'streaks', 'streak_days >= 3'),
('weekly-warrior', 'Weekly Warrior', '7-day activity streak.', 'Swords', 'streaks', 'streak_days >= 7'),
('fortnight-fighter', 'Fortnight Fighter', '14-day activity streak.', 'Shield', 'streaks', 'streak_days >= 14'),
('three-weeks-strong', 'Three Weeks Strong', '21-day activity streak.', 'Flame', 'streaks', 'streak_days >= 21'),
('monthly-master', 'Monthly Master', '30-day activity streak.', 'Calendar', 'streaks', 'streak_days >= 30'),
('unstoppable', 'Unstoppable', '100-day activity streak.', 'Mountain', 'streaks', 'streak_days >= 100'),
('half-year', 'Half a Year', '180-day activity streak.', 'Sun', 'streaks', 'streak_days >= 180'),

-- Chores & Tasks
('task-master', 'Task Master', 'Complete 100 tasks of any type.', 'CheckSquare', 'tasks', 'total_tasks >= 100'),
('well-rounded', 'Well-Rounded', 'Complete at least 5 tasks in all 5 main categories.', 'PieChart', 'tasks', 'all_categories >= 5'),
('helping-hand', 'Helping Hand', 'Complete 10 chores.', 'Hand', 'tasks', 'chores >= 10'),
('chore-champion', 'Chore Champion', 'Complete 50 chores.', 'Broom', 'tasks', 'chores >= 50'),
('chore-legend', 'Chore Legend', 'Complete 100 chores.', 'Sparkles', 'tasks', 'chores >= 100'),
('brainiac', 'Brainiac', 'Complete 10 homework tasks.', 'Brain', 'tasks', 'homework >= 10'),
('a-plus-student', 'A+ Student', 'Complete 50 homework tasks.', 'GraduationCap', 'tasks', 'homework >= 50'),
('homework-hero', 'Homework Hero', 'Complete 100 homework tasks.', 'BookOpen', 'tasks', 'homework >= 100'),
('good-citizen', 'Good Citizen', 'Complete 10 behavior tasks.', 'Smile', 'tasks', 'behavior >= 10'),
('angel', 'Angel', 'Complete 50 behavior tasks.', 'Heart', 'tasks', 'behavior >= 50'),
('role-model', 'Role Model', 'Complete 100 behavior tasks.', 'Star', 'tasks', 'behavior >= 100'),
('healthy-habits', 'Healthy Habits', 'Complete 10 health tasks.', 'Apple', 'tasks', 'health >= 10'),
('creative-spark', 'Creative Spark', 'Complete 10 creative tasks.', 'Palette', 'tasks', 'creative >= 10'),

-- Pet Care
('pet-lover', 'Pet Lover', 'Feed your pet for the first time.', 'Bone', 'pets', 'pet_fed_total >= 1'),
('animal-lover', 'Animal Lover', 'Feed your pet 10 times total.', 'Dog', 'pets', 'pet_fed_total >= 10'),
('pet-whisperer', 'Pet Whisperer', 'Feed your pet 50 times total.', 'Cat', 'pets', 'pet_fed_total >= 50'),
('ultimate-caretaker', 'Ultimate Caretaker', 'Feed your pet 100 times total.', 'Heart', 'pets', 'pet_fed_total >= 100'),
('best-friend', 'Best Friend', 'Keep your pet happy for 7 days in a row.', 'Smile', 'pets', 'pet_happy_streak >= 7'),
('pet-guardian', 'Pet Guardian', 'Keep your pet happy for 14 days in a row.', 'Shield', 'pets', 'pet_happy_streak >= 14'),

-- Savings & Financials
('first-deposit', 'First Deposit', 'Put coins in the savings pot for the first time.', 'PiggyBank', 'savings', 'savings_deposits >= 1'),
('goal-getter', 'Goal Getter', 'Reach a savings goal.', 'Target', 'savings', 'savings_goals_met >= 1'),
('super-saver', 'Super Saver', 'Reach 3 savings goals.', 'Layers', 'savings', 'savings_goals_met >= 3'),
('generous-spirit', 'Generous Spirit', 'Make a gift (charity or sibling).', 'Gift', 'savings', 'gifts_made >= 1'),
('philanthropist', 'Philanthropist', 'Make 5 gifts.', 'HeartHandshake', 'savings', 'gifts_made >= 5'),

-- Responsibility
('handyman', 'Handyman', 'Fix a broken gold pot.', 'Wrench', 'responsibility', 'gold_pot_fixes >= 1'),
('gold-pot-guardian', 'Gold Pot Guardian', 'Go 30 days without breaking the gold pot.', 'ShieldCheck', 'responsibility', 'gold_pot_unbroken_days >= 30')
ON CONFLICT (id) DO NOTHING;

-- Extra columns for badge tracking
ALTER TABLE children
ADD COLUMN IF NOT EXISTS pet_fed_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_happy_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_deposits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_goals_met INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifts_made INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_pot_fixes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_pot_unbroken_days INTEGER DEFAULT 0;
