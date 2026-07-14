-- Migration: Secure RLS Policies
-- Description: Drops public access policies and adds strict parent policies based on auth.jwt() ->> 'email'

-- 1. Drop all permissive public policies
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

DROP POLICY IF EXISTS "Allow public select for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Allow public insert for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Allow public update for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Allow public delete for reward_redemptions" ON reward_redemptions;

DROP POLICY IF EXISTS "Allow public select for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Allow public insert for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Allow public update for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Allow public delete for child_badges" ON child_badges;

-- Note: We intentionally do NOT drop "Allow public select for badges" because the badges catalog is public.

-- 2. Add secure parent policies
-- Note: 'children' uses parent_id
CREATE POLICY "Enable parent select for children" ON children
  FOR SELECT USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent insert for children" ON children
  FOR INSERT WITH CHECK (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent update for children" ON children
  FOR UPDATE USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent delete for children" ON children
  FOR DELETE USING (parent_id = auth.jwt() ->> 'email');

-- Note: 'tasks' uses parent_id
CREATE POLICY "Enable parent select for tasks" ON tasks
  FOR SELECT USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent insert for tasks" ON tasks
  FOR INSERT WITH CHECK (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent update for tasks" ON tasks
  FOR UPDATE USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent delete for tasks" ON tasks
  FOR DELETE USING (parent_id = auth.jwt() ->> 'email');

-- Note: 'rewards' uses parent_id
CREATE POLICY "Enable parent select for rewards" ON rewards
  FOR SELECT USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent insert for rewards" ON rewards
  FOR INSERT WITH CHECK (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent update for rewards" ON rewards
  FOR UPDATE USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent delete for rewards" ON rewards
  FOR DELETE USING (parent_id = auth.jwt() ->> 'email');

-- Note: 'reward_redemptions' uses parent_id
CREATE POLICY "Enable parent select for reward_redemptions" ON reward_redemptions
  FOR SELECT USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent insert for reward_redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent update for reward_redemptions" ON reward_redemptions
  FOR UPDATE USING (parent_id = auth.jwt() ->> 'email');
CREATE POLICY "Enable parent delete for reward_redemptions" ON reward_redemptions
  FOR DELETE USING (parent_id = auth.jwt() ->> 'email');

-- Note: 'completions' does NOT have parent_id, so we link through children.id
CREATE POLICY "Enable parent select for completions" ON completions
  FOR SELECT USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = completions.child_id));
CREATE POLICY "Enable parent insert for completions" ON completions
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = completions.child_id));
CREATE POLICY "Enable parent update for completions" ON completions
  FOR UPDATE USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = completions.child_id));
CREATE POLICY "Enable parent delete for completions" ON completions
  FOR DELETE USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = completions.child_id));

-- Note: 'child_badges' does NOT have parent_id, so we link through children.id
CREATE POLICY "Enable parent select for child_badges" ON child_badges
  FOR SELECT USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = child_badges.child_id));
CREATE POLICY "Enable parent insert for child_badges" ON child_badges
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = child_badges.child_id));
CREATE POLICY "Enable parent update for child_badges" ON child_badges
  FOR UPDATE USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = child_badges.child_id));
CREATE POLICY "Enable parent delete for child_badges" ON child_badges
  FOR DELETE USING ((auth.jwt() ->> 'email') IN (SELECT parent_id FROM children WHERE id = child_badges.child_id));
