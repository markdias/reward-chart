import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let currentInitializedUrl = '';
let currentInitializedKey = '';

export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: envUrl.trim(), key: envKey.trim() };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return !!(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    supabaseInstance = null;
    currentInitializedUrl = '';
    currentInitializedKey = '';
    return null;
  }

  const { url, key } = getSupabaseConfig();
  
  if (!supabaseInstance || currentInitializedUrl !== url || currentInitializedKey !== key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      currentInitializedUrl = url;
      currentInitializedKey = key;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      currentInitializedUrl = '';
      currentInitializedKey = '';
    }
  }
  return supabaseInstance;
}

// SQL Schema script for user setup in Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- 1. Cleanup Old Conflicting Policies (Prevents Infinite Recursion & Duplicate Errors)
DROP POLICY IF EXISTS "Allow public select for children" ON children;
DROP POLICY IF EXISTS "Allow public insert for children" ON children;
DROP POLICY IF EXISTS "Allow public update for children" ON children;
DROP POLICY IF EXISTS "Allow public delete for children" ON children;

DROP POLICY IF EXISTS "Allow public select for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public delete for tasks" ON tasks;

DROP POLICY IF EXISTS "Allow public select for completions" ON completions;
DROP POLICY IF EXISTS "Allow public insert for completions" ON completions;
DROP POLICY IF EXISTS "Allow public update for completions" ON completions;
DROP POLICY IF EXISTS "Allow public delete for completions" ON completions;

DROP POLICY IF EXISTS "Allow public select for rewards" ON rewards;
DROP POLICY IF EXISTS "Allow public insert for rewards" ON rewards;
DROP POLICY IF EXISTS "Allow public update for rewards" ON rewards;
DROP POLICY IF EXISTS "Allow public delete for rewards" ON rewards;

-- Cleanup custom policies that might have caused recursion or type mismatches
DROP POLICY IF EXISTS "Allow parent select" ON children;
DROP POLICY IF EXISTS "Allow parent insert" ON children;
DROP POLICY IF EXISTS "Allow parent update" ON children;
DROP POLICY IF EXISTS "Allow parent delete" ON children;
DROP POLICY IF EXISTS "Allow parent select" ON tasks;
DROP POLICY IF EXISTS "Allow parent select" ON completions;
DROP POLICY IF EXISTS "Allow parent select" ON rewards;

-- 2. Create Tables (Using TEXT for IDs and Parent ID email strings to avoid uuid/text type mismatches)
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  character_id TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp_in_level INTEGER DEFAULT 0,
  pet_food INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  level_up_gold_reward INTEGER,
  level_up_preference TEXT,
  level_up_bonuses_received INTEGER DEFAULT 0,
  weekly_xp_target INTEGER,
  weekly_reward_points INTEGER,
  monthly_xp_target INTEGER,
  monthly_reward_points INTEGER,
  last_weekly_bonus_awarded TEXT,
  last_monthly_bonus_awarded TEXT,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  last_active_week TEXT,
  last_active_month TEXT,
  weekly_reset_date TEXT,
  monthly_reset_date TEXT,
  last_active_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  title TEXT NOT NULL,
  points INTEGER NOT NULL,
  xp INTEGER,
  category TEXT NOT NULL,
  recurrence TEXT NOT NULL,
  cooldown_minutes INTEGER,
  is_template BOOLEAN DEFAULT FALSE,
  template_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL, -- pending, approved, rejected
  points_awarded INTEGER NOT NULL,
  xp_awarded INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  title TEXT NOT NULL,
  cost_points INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  template_id TEXT,
  icon_name TEXT NOT NULL,
  limit_type TEXT DEFAULT 'unlimited',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id TEXT PRIMARY KEY,
  reward_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL -- requested, delivered
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- 4. Create Simple, Non-Recursive, Type-Safe Policies
-- These policies use simple TRUE checks to avoid recursion and permit smooth operation.
CREATE POLICY "Allow public select for children" ON children FOR SELECT USING (true);
CREATE POLICY "Allow public insert for children" ON children FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for children" ON children FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for children" ON children FOR DELETE USING (true);

CREATE POLICY "Allow public select for tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert for tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for tasks" ON tasks FOR DELETE USING (true);

CREATE POLICY "Allow public select for completions" ON completions FOR SELECT USING (true);
CREATE POLICY "Allow public insert for completions" ON completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for completions" ON completions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for completions" ON completions FOR DELETE USING (true);

CREATE POLICY "Allow public select for rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "Allow public insert for rewards" ON rewards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for rewards" ON rewards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for rewards" ON rewards FOR DELETE USING (true);

CREATE POLICY "Allow public select for reward_redemptions" ON reward_redemptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert for reward_redemptions" ON reward_redemptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for reward_redemptions" ON reward_redemptions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for reward_redemptions" ON reward_redemptions FOR DELETE USING (true);

-- 💡 SECURE ALTERNATIVE FOR PRODUCTION (Email-based isolation to prevent other parents from seeing your children):
-- Since 'parent_id' is stored as the parent's email address (TEXT), we compare it directly with the email inside the JWT.
-- This avoids type casting mismatches (like comparing auth.uid() uuid to text parent_id) and has zero recursion.
-- To use, uncomment the lines below in your SQL editor:
--
-- DROP POLICY IF EXISTS "Allow public select for children" ON children;
-- CREATE POLICY "Allow secure select for children" ON children FOR SELECT TO authenticated USING (parent_id = auth.jwt() ->> 'email');
-- CREATE POLICY "Allow secure insert for children" ON children FOR INSERT TO authenticated WITH CHECK (parent_id = auth.jwt() ->> 'email');
-- CREATE POLICY "Allow secure update for children" ON children FOR UPDATE TO authenticated USING (parent_id = auth.jwt() ->> 'email');
-- CREATE POLICY "Allow secure delete for children" ON children FOR DELETE TO authenticated USING (parent_id = auth.jwt() ->> 'email');
`;
