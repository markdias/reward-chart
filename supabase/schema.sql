-- =============================================================================
-- Reward Chart – Consolidated Schema
-- Represents the current database state after all migrations have been applied.
-- Safe to run against a clean (empty) Supabase project.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- EXTENSIONS (enabled by default on Supabase, listed for completeness)
-- ---------------------------------------------------------------------------
-- pg_net is required for the push-notification webhook trigger.
-- It is enabled via the Supabase dashboard; no CREATE EXTENSION needed here.


-- =============================================================================
-- TABLE: parent_profiles
-- One row per parent/guardian auth user. family_id is shared across co-parents.
-- =============================================================================
CREATE TABLE IF NOT EXISTS parent_profiles (
  user_id                           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                             TEXT UNIQUE NOT NULL,
  name                              TEXT,
  family_id                         TEXT NOT NULL,
  family_name                       TEXT,
  pin                               TEXT DEFAULT '0000',
  share_token                       TEXT UNIQUE,

  -- Economy configuration
  level_up_gold_reward              INTEGER DEFAULT 10,
  points_to_level_up                INTEGER DEFAULT 500,
  weekly_points_target              INTEGER DEFAULT 100,
  daily_points_target               INTEGER DEFAULT 50,
  monthly_points_target             INTEGER DEFAULT 500,

  -- Bonus reward amounts
  weekly_reward_points              INTEGER DEFAULT 50,
  daily_reward_points               INTEGER NOT NULL DEFAULT 50,
  monthly_reward_points             INTEGER DEFAULT 200,

  -- Pot unlock levels (level thresholds)
  savings_pot_unlock_level          INTEGER DEFAULT 2,
  food_pot_unlock_level             INTEGER DEFAULT 4,
  gifting_pot_unlock_level          INTEGER DEFAULT 6,

  -- Gold pot maintenance
  gold_pot_maintenance_unlock_level INTEGER DEFAULT 8,
  gold_pot_maintenance_cost         INTEGER DEFAULT 2,

  -- UI preference
  dashboard_style                   TEXT NOT NULL DEFAULT 'modern'
);

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read parent_profiles" ON parent_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update parent_profiles" ON parent_profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert parent_profiles" ON parent_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'parent_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE parent_profiles;
  END IF;
END $$;


-- =============================================================================
-- TABLE: children
-- One row per child. parent_id = family_id (email) of the owning parent.
-- =============================================================================
CREATE TABLE IF NOT EXISTS children (
  id                                TEXT PRIMARY KEY,
  parent_id                         TEXT NOT NULL,
  name                              TEXT NOT NULL,
  age                               INTEGER,
  avatar_url                        TEXT NOT NULL DEFAULT '',
  character_id                      TEXT NOT NULL DEFAULT 'unicorn',

  -- Core economy
  points                            INTEGER NOT NULL DEFAULT 0,
  lifetime_points                   INTEGER NOT NULL DEFAULT 0,
  level                             INTEGER NOT NULL DEFAULT 1,
  pet_food                          INTEGER NOT NULL DEFAULT 0,
  streak_days                       INTEGER NOT NULL DEFAULT 0,

  -- Weekly / monthly tracking
  weekly_points                     INTEGER DEFAULT 0,
  monthly_points                    INTEGER DEFAULT 0,
  last_active_week                  TEXT,
  last_active_month                 TEXT,
  last_active_date                  TEXT,
  weekly_reset_date                 TEXT,
  monthly_reset_date                TEXT,

  -- Bonus tracking
  level_up_bonuses_received         INTEGER DEFAULT 0,
  last_weekly_bonus_awarded         TEXT,
  last_monthly_bonus_awarded        TEXT,

  -- Savings pot
  savings_pot                       INTEGER NOT NULL DEFAULT 0,
  savings_unlocked                  BOOLEAN NOT NULL DEFAULT false,
  savings_unlock_seen               BOOLEAN NOT NULL DEFAULT false,
  last_saved_date                   TEXT,
  savings_goal_name                 TEXT,
  savings_goal_amount               INTEGER,
  savings_goal_reward_id            TEXT,

  -- Food pot and pet care
  food_pot_unlocked                 BOOLEAN NOT NULL DEFAULT false,
  food_pot_unlock_seen              BOOLEAN NOT NULL DEFAULT false,
  food_pot_weekly_contribution      INTEGER DEFAULT 0,
  pet_fed_today                     BOOLEAN NOT NULL DEFAULT true,
  pet_hunger_time                   TIMESTAMP WITH TIME ZONE,
  pet_unhappy                       BOOLEAN NOT NULL DEFAULT false,
  last_fed_date                     TEXT,
  last_hunger_check_date            TEXT,
  pet_fed_total                     INTEGER DEFAULT 0,
  pet_happy_streak                  INTEGER DEFAULT 0,

  -- Gifting pot
  gifting_unlocked                  BOOLEAN NOT NULL DEFAULT false,
  gifting_unlock_seen               BOOLEAN NOT NULL DEFAULT false,
  last_gifting_date                 TIMESTAMP WITH TIME ZONE,

  -- Gold pot (breakage mechanic)
  gold_pot_broken                   BOOLEAN DEFAULT false,
  gold_pot_break_count_this_week    INTEGER DEFAULT 0,
  gold_pot_break_week               TEXT,
  gold_pot_last_check_date          TEXT,
  gold_pot_last_leak_date           TEXT,
  gold_pot_last_fix_date            TEXT,
  gold_pot_total_leaked             INTEGER DEFAULT 0,
  gold_pot_intro_seen               BOOLEAN DEFAULT false,
  gold_pot_maintenance_unlock_seen  BOOLEAN DEFAULT false,

  -- Nudge system
  has_pending_nudge                 BOOLEAN DEFAULT false,
  last_nudge_time                   TIMESTAMP WITH TIME ZONE,

  -- Child login / linking
  child_share_token                 TEXT UNIQUE,
  linked_email                      TEXT,

  -- Routines (JSONB array of objects with morningTaskIds / afternoonTaskIds / eveningTaskIds)
  routines JSONB DEFAULT '[
    {"id": "weekday", "name": "Weekday",  "morningTaskIds": [], "afternoonTaskIds": [], "eveningTaskIds": []},
    {"id": "weekend", "name": "Weekend",  "morningTaskIds": [], "afternoonTaskIds": [], "eveningTaskIds": []},
    {"id": "holiday", "name": "Holiday",  "morningTaskIds": [], "afternoonTaskIds": [], "eveningTaskIds": []}
  ]'::jsonb,
  active_routine_id                 TEXT DEFAULT 'weekday',
  holiday_mode                      BOOLEAN DEFAULT false,

  -- Badge-tracking counters
  savings_deposits                  INTEGER DEFAULT 0,
  savings_goals_met                 INTEGER DEFAULT 0,
  gifts_made                        INTEGER DEFAULT 0,
  gold_pot_fixes                    INTEGER DEFAULT 0,
  gold_pot_unbroken_days            INTEGER DEFAULT 0,
  manual_deductions                 INTEGER DEFAULT 0,

  created_at                        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Parent policies (set after child_profiles exists via forward-ref; Postgres resolves at runtime)
CREATE POLICY "Enable parent select for children" ON children
  FOR SELECT USING (
    parent_id IN (
      auth.jwt() ->> 'email',
      (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
    )
    OR linked_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Enable parent insert for children" ON children
  FOR INSERT WITH CHECK (
    parent_id IN (
      auth.jwt() ->> 'email',
      (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Enable parent update for children" ON children
  FOR UPDATE USING (
    parent_id IN (
      auth.jwt() ->> 'email',
      (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
    )
    OR linked_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Enable parent delete for children" ON children
  FOR DELETE USING (
    parent_id IN (
      auth.jwt() ->> 'email',
      (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
    )
  );

-- Child-account policies (child_profiles created below; Postgres resolves sub-select at runtime)
CREATE POLICY "Enable read for linked child" ON children
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = children.id)
  );

CREATE POLICY "Enable update for linked child" ON children
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = children.id)
  );


-- =============================================================================
-- TABLE: child_profiles
-- Maps a Supabase auth user (child login) to a children row.
-- =============================================================================
CREATE TABLE IF NOT EXISTS child_profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id   TEXT UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for self" ON child_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for self" ON child_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- TABLE: tasks
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id               TEXT PRIMARY KEY,
  parent_id        TEXT NOT NULL,
  child_id         TEXT,
  title            TEXT NOT NULL,
  points           INTEGER NOT NULL DEFAULT 1,
  category         TEXT NOT NULL DEFAULT 'chores'
                     CHECK (category IN ('chores','homework','behavior','health','creative','other')),
  recurrence       TEXT NOT NULL DEFAULT 'daily'
                     CHECK (recurrence IN ('daily','weekly','one_time','repeatable')),
  cooldown_minutes INTEGER,
  is_template      BOOLEAN DEFAULT false,
  template_id      TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  age_range        TEXT CHECK (age_range IN ('3-5','6-8','9-12','all')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable parent select for tasks" ON tasks
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for tasks" ON tasks
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for tasks" ON tasks
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for tasks" ON tasks
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Enable read tasks for linked child" ON tasks
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = tasks.child_id)
  );


-- =============================================================================
-- TABLE: completions
-- =============================================================================
CREATE TABLE IF NOT EXISTS completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  child_id       TEXT NOT NULL,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  notes          TEXT
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable parent select for completions" ON completions
  FOR SELECT USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent insert for completions" ON completions
  FOR INSERT WITH CHECK (
    (SELECT parent_id FROM children WHERE id = completions.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent update for completions" ON completions
  FOR UPDATE USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent delete for completions" ON completions
  FOR DELETE USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Enable read completions for linked child" ON completions
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = completions.child_id)
  );
CREATE POLICY "Enable insert completions for linked child" ON completions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = completions.child_id)
  );


-- =============================================================================
-- TABLE: rewards
-- =============================================================================
CREATE TABLE IF NOT EXISTS rewards (
  id                TEXT PRIMARY KEY,
  parent_id         TEXT NOT NULL,
  child_id          TEXT,
  title             TEXT NOT NULL,
  cost_points       INTEGER NOT NULL DEFAULT 10,
  is_available      BOOLEAN NOT NULL DEFAULT true,
  is_template       BOOLEAN DEFAULT false,
  template_id       TEXT REFERENCES rewards(id) ON DELETE CASCADE,
  icon_name         TEXT NOT NULL DEFAULT 'Gift',
  limit_type        TEXT NOT NULL DEFAULT 'unlimited'
                      CHECK (limit_type IN ('unlimited','daily','twice_daily','one_time')),
  is_badge_eligible BOOLEAN DEFAULT false,
  age_range         TEXT CHECK (age_range IN ('3-5','6-8','9-12','all')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable parent select for rewards" ON rewards
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for rewards" ON rewards
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for rewards" ON rewards
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for rewards" ON rewards
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Enable read rewards for linked child" ON rewards
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = rewards.child_id)
  );


-- =============================================================================
-- TABLE: reward_redemptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id      TEXT NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  child_id       TEXT NOT NULL,
  parent_id      TEXT NOT NULL,
  redeemed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         TEXT NOT NULL DEFAULT 'requested'
                   CHECK (status IN ('requested','delivered','rejected')),
  payment_source TEXT DEFAULT 'main'
);

ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable parent select for reward_redemptions" ON reward_redemptions
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for reward_redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for reward_redemptions" ON reward_redemptions
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for reward_redemptions" ON reward_redemptions
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Enable read reward_redemptions for linked child" ON reward_redemptions
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = reward_redemptions.child_id)
  );
CREATE POLICY "Enable insert reward_redemptions for linked child" ON reward_redemptions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = reward_redemptions.child_id)
  );


-- =============================================================================
-- TABLE: gifting_requests
-- =============================================================================
CREATE TABLE IF NOT EXISTS gifting_requests (
  id           TEXT PRIMARY KEY,
  child_id     TEXT REFERENCES children(id) ON DELETE CASCADE,
  family_id    TEXT NOT NULL,
  amount       NUMERIC NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('charity','sibling')),
  sibling_id   TEXT REFERENCES children(id) ON DELETE CASCADE,
  charity_name TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE gifting_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their family gifting requests" ON gifting_requests
  FOR ALL USING (
    family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'gifting_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE gifting_requests;
  END IF;
END $$;



-- =============================================================================
-- TABLE: badges  (static catalogue – public read)
-- =============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT NOT NULL,
  icon_name             TEXT NOT NULL,
  category              TEXT NOT NULL,
  unlock_condition_hint TEXT
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for badges" ON badges
  FOR SELECT USING (true);


-- =============================================================================
-- TABLE: child_badges
-- =============================================================================
CREATE TABLE IF NOT EXISTS child_badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id       TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id       TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (child_id, badge_id)
);

ALTER TABLE child_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable parent select for child_badges" ON child_badges
  FOR SELECT USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent insert for child_badges" ON child_badges
  FOR INSERT WITH CHECK (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent update for child_badges" ON child_badges
  FOR UPDATE USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent delete for child_badges" ON child_badges
  FOR DELETE USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id)
      IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Enable read child_badges for linked child" ON child_badges
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = child_badges.child_id)
  );


-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- delete_user_account: removes a parent and all family data, then deletes the auth user
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_family_id TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT family_id INTO v_family_id FROM parent_profiles WHERE user_id = v_user_id;

  IF v_family_id IS NOT NULL THEN
    DELETE FROM completions
      WHERE child_id IN (SELECT id FROM children WHERE parent_id = v_family_id);
    DELETE FROM children           WHERE parent_id  = v_family_id;
    DELETE FROM tasks              WHERE parent_id  = v_family_id;
    DELETE FROM rewards            WHERE parent_id  = v_family_id;
    DELETE FROM reward_redemptions WHERE parent_id  = v_family_id;
    DELETE FROM gifting_requests   WHERE family_id  = v_family_id;

  END IF;

  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- delete_child_account: removes a child's auth account (cascades child_profiles row)
CREATE OR REPLACE FUNCTION delete_child_account(p_child_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_user_id UUID;
BEGIN
  SELECT user_id INTO v_child_user_id FROM child_profiles WHERE child_id = p_child_id;
  IF v_child_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_child_user_id;
  END IF;
END;
$$;

-- notify_parent_webhook: fires on completions / reward_redemptions INSERT
-- Requires the pg_net extension to be enabled in the Supabase dashboard.
CREATE OR REPLACE FUNCTION public.notify_parent_webhook()
RETURNS trigger AS $$
DECLARE
  edge_function_url TEXT := 'https://qnbpenvudqrngbxelvnx.supabase.co/functions/v1/notify-parent';
  request_body JSON;
BEGIN
  request_body := json_build_object(
    'type',   TG_OP,
    'table',  TG_TABLE_NAME,
    'record', row_to_json(NEW),
    'schema', TG_TABLE_SCHEMA
  );

  PERFORM net.http_post(
    url     := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <YOUR_ANON_KEY>'
    ),
    body := request_body::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_completion_notify   ON public.completions;
DROP TRIGGER IF EXISTS on_reward_redemption_notify ON public.reward_redemptions;

CREATE TRIGGER on_task_completion_notify
  AFTER INSERT ON public.completions
  FOR EACH ROW EXECUTE FUNCTION public.notify_parent_webhook();

CREATE TRIGGER on_reward_redemption_notify
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.notify_parent_webhook();


-- =============================================================================
-- SEED DATA: 50 badges
-- =============================================================================
INSERT INTO badges (id, name, description, icon_name, category, unlock_condition_hint) VALUES

-- Coins & Wealth
('first-coin',       'First Coin',       'Earn your first coin.',           'CircleDollarSign', 'coins', 'points > 0'),
('pocket-money',     'Pocket Money',     'Reach 50 lifetime coins.',        'Wallet',            'coins', 'lifetime_points >= 50'),
('coin-collector',   'Coin Collector',   'Reach 100 lifetime coins.',       'Coins',             'coins', 'lifetime_points >= 100'),
('piggy-bank-full',  'Piggy Bank Full',  'Reach 250 lifetime coins.',       'PiggyBank',         'coins', 'lifetime_points >= 250'),
('treasure-hunter',  'Treasure Hunter',  'Reach 500 lifetime coins.',       'Map',               'coins', 'lifetime_points >= 500'),
('rich-king',        'Rich as a King',   'Reach 1,000 lifetime coins.',     'Crown',             'coins', 'lifetime_points >= 1000'),
('gold-miner',       'Gold Miner',       'Reach 2,500 lifetime coins.',     'Pickaxe',           'coins', 'lifetime_points >= 2500'),
('dragons-hoard',    'Dragon''s Hoard',  'Reach 5,000 lifetime coins.',     'Gem',               'coins', 'lifetime_points >= 5000'),

-- Level Progression
('rising-star',      'Rising Star',            'Reach Level 2.',   'Star',       'levels', 'level >= 2'),
('getting-hang',     'Getting the Hang of It', 'Reach Level 3.',   'ThumbsUp',   'levels', 'level >= 3'),
('on-the-move',      'On the Move',            'Reach Level 5.',   'TrendingUp', 'levels', 'level >= 5'),
('high-flyer',       'High Flyer',             'Reach Level 10.',  'Rocket',     'levels', 'level >= 10'),
('seasoned-pro',     'Seasoned Pro',           'Reach Level 15.',  'Medal',      'levels', 'level >= 15'),
('master-house',     'Master of the House',    'Reach Level 20.',  'Key',        'levels', 'level >= 20'),
('expert-status',    'Expert Status',          'Reach Level 30.',  'Award',      'levels', 'level >= 30'),
('legendary',        'Legendary',              'Reach Level 50.',  'Trophy',     'levels', 'level >= 50'),

-- Streaks & Consistency
('just-getting-started', 'Just Getting Started', '2-day activity streak.',   'Zap',      'streaks', 'streak_days >= 2'),
('threes-charm',         'Three''s a Charm',     '3-day activity streak.',   'Sparkles', 'streaks', 'streak_days >= 3'),
('weekly-warrior',       'Weekly Warrior',        '7-day activity streak.',   'Swords',   'streaks', 'streak_days >= 7'),
('fortnight-fighter',    'Fortnight Fighter',     '14-day activity streak.',  'Shield',   'streaks', 'streak_days >= 14'),
('three-weeks-strong',   'Three Weeks Strong',    '21-day activity streak.',  'Flame',    'streaks', 'streak_days >= 21'),
('monthly-master',       'Monthly Master',        '30-day activity streak.',  'Calendar', 'streaks', 'streak_days >= 30'),
('unstoppable',          'Unstoppable',           '100-day activity streak.', 'Mountain', 'streaks', 'streak_days >= 100'),
('half-year',            'Half a Year',           '180-day activity streak.', 'Sun',      'streaks', 'streak_days >= 180'),

-- Chores & Tasks
('task-master',    'Task Master',    'Complete 100 tasks of any type.',                       'CheckSquare',   'tasks', 'total_tasks >= 100'),
('well-rounded',   'Well-Rounded',   'Complete at least 5 tasks in all 5 main categories.',  'PieChart',      'tasks', 'all_categories >= 5'),
('helping-hand',   'Helping Hand',   'Complete 10 chores.',                                   'Hand',          'tasks', 'chores >= 10'),
('chore-champion', 'Chore Champion', 'Complete 50 chores.',                                   'Broom',         'tasks', 'chores >= 50'),
('chore-legend',   'Chore Legend',   'Complete 100 chores.',                                  'Sparkles',      'tasks', 'chores >= 100'),
('brainiac',       'Brainiac',       'Complete 10 homework tasks.',                           'Brain',         'tasks', 'homework >= 10'),
('a-plus-student', 'A+ Student',     'Complete 50 homework tasks.',                           'GraduationCap', 'tasks', 'homework >= 50'),
('homework-hero',  'Homework Hero',  'Complete 100 homework tasks.',                          'BookOpen',      'tasks', 'homework >= 100'),
('good-citizen',   'Good Citizen',   'Complete 10 behavior tasks.',                           'Smile',         'tasks', 'behavior >= 10'),
('angel',          'Angel',          'Complete 50 behavior tasks.',                           'Heart',         'tasks', 'behavior >= 50'),
('role-model',     'Role Model',     'Complete 100 behavior tasks.',                          'Star',          'tasks', 'behavior >= 100'),
('healthy-habits', 'Healthy Habits', 'Complete 10 health tasks.',                             'Apple',         'tasks', 'health >= 10'),
('creative-spark', 'Creative Spark', 'Complete 10 creative tasks.',                           'Palette',       'tasks', 'creative >= 10'),

-- Pet Care
('pet-lover',          'Pet Lover',         'Feed your pet for the first time.',           'Bone',  'pets', 'pet_fed_total >= 1'),
('animal-lover',       'Animal Lover',      'Feed your pet 10 times total.',               'Dog',   'pets', 'pet_fed_total >= 10'),
('pet-whisperer',      'Pet Whisperer',     'Feed your pet 50 times total.',               'Cat',   'pets', 'pet_fed_total >= 50'),
('ultimate-caretaker', 'Ultimate Caretaker','Feed your pet 100 times total.',              'Heart', 'pets', 'pet_fed_total >= 100'),
('best-friend',        'Best Friend',       'Keep your pet happy for 7 days in a row.',   'Smile', 'pets', 'pet_happy_streak >= 7'),
('pet-guardian',       'Pet Guardian',      'Keep your pet happy for 14 days in a row.',  'Shield','pets', 'pet_happy_streak >= 14'),

-- Savings & Financials
('first-deposit',   'First Deposit',   'Put coins in the savings pot for the first time.','PiggyBank',     'savings', 'savings_deposits >= 1'),
('goal-getter',     'Goal Getter',     'Reach a savings goal.',                            'Target',        'savings', 'savings_goals_met >= 1'),
('super-saver',     'Super Saver',     'Reach 3 savings goals.',                           'Layers',        'savings', 'savings_goals_met >= 3'),
('generous-spirit', 'Generous Spirit', 'Make a gift (charity or sibling).',                'Gift',          'savings', 'gifts_made >= 1'),
('philanthropist',  'Philanthropist',  'Make 5 gifts.',                                    'HeartHandshake','savings', 'gifts_made >= 5'),

-- Responsibility
('handyman',          'Handyman',          'Fix a broken gold pot.',                     'Wrench',     'responsibility', 'gold_pot_fixes >= 1'),
('gold-pot-guardian', 'Gold Pot Guardian', 'Go 30 days without breaking the gold pot.', 'ShieldCheck','responsibility', 'gold_pot_unbroken_days >= 30')

ON CONFLICT (id) DO NOTHING;
