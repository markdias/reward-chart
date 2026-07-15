-- Migration: Fix Linked Parents RLS Policies
-- Description: Updates the strict parent policies to also allow access to linked parents based on their family_id in parent_profiles.

-- 1. Drop existing policies from the previous migration
DROP POLICY IF EXISTS "Enable parent select for children" ON children;
DROP POLICY IF EXISTS "Enable parent insert for children" ON children;
DROP POLICY IF EXISTS "Enable parent update for children" ON children;
DROP POLICY IF EXISTS "Enable parent delete for children" ON children;

DROP POLICY IF EXISTS "Enable parent select for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable parent insert for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable parent update for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable parent delete for tasks" ON tasks;

DROP POLICY IF EXISTS "Enable parent select for rewards" ON rewards;
DROP POLICY IF EXISTS "Enable parent insert for rewards" ON rewards;
DROP POLICY IF EXISTS "Enable parent update for rewards" ON rewards;
DROP POLICY IF EXISTS "Enable parent delete for rewards" ON rewards;

DROP POLICY IF EXISTS "Enable parent select for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Enable parent insert for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Enable parent update for reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Enable parent delete for reward_redemptions" ON reward_redemptions;

DROP POLICY IF EXISTS "Enable parent select for completions" ON completions;
DROP POLICY IF EXISTS "Enable parent insert for completions" ON completions;
DROP POLICY IF EXISTS "Enable parent update for completions" ON completions;
DROP POLICY IF EXISTS "Enable parent delete for completions" ON completions;

DROP POLICY IF EXISTS "Enable parent select for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Enable parent insert for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Enable parent update for child_badges" ON child_badges;
DROP POLICY IF EXISTS "Enable parent delete for child_badges" ON child_badges;


-- 2. Create updated policies allowing linked parents
-- Note: 'children' uses parent_id, but also has linked_email
CREATE POLICY "Enable parent select for children" ON children
  FOR SELECT USING (
    parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
    OR linked_email = auth.jwt() ->> 'email'
  );
CREATE POLICY "Enable parent insert for children" ON children
  FOR INSERT WITH CHECK (
    parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent update for children" ON children
  FOR UPDATE USING (
    parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
    OR linked_email = auth.jwt() ->> 'email'
  );
CREATE POLICY "Enable parent delete for children" ON children
  FOR DELETE USING (
    parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );

-- Note: 'tasks' uses parent_id
CREATE POLICY "Enable parent select for tasks" ON tasks
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for tasks" ON tasks
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for tasks" ON tasks
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for tasks" ON tasks
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

-- Note: 'rewards' uses parent_id
CREATE POLICY "Enable parent select for rewards" ON rewards
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for rewards" ON rewards
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for rewards" ON rewards
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for rewards" ON rewards
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

-- Note: 'reward_redemptions' uses parent_id
CREATE POLICY "Enable parent select for reward_redemptions" ON reward_redemptions
  FOR SELECT USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent insert for reward_redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent update for reward_redemptions" ON reward_redemptions
  FOR UPDATE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Enable parent delete for reward_redemptions" ON reward_redemptions
  FOR DELETE USING (parent_id IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())));

-- Note: 'completions' does NOT have parent_id, so we link through children.id
CREATE POLICY "Enable parent select for completions" ON completions
  FOR SELECT USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent insert for completions" ON completions
  FOR INSERT WITH CHECK (
    (SELECT parent_id FROM children WHERE id = completions.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent update for completions" ON completions
  FOR UPDATE USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent delete for completions" ON completions
  FOR DELETE USING (
    (SELECT parent_id FROM children WHERE id = completions.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );

-- Note: 'child_badges' does NOT have parent_id, so we link through children.id
CREATE POLICY "Enable parent select for child_badges" ON child_badges
  FOR SELECT USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent insert for child_badges" ON child_badges
  FOR INSERT WITH CHECK (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent update for child_badges" ON child_badges
  FOR UPDATE USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY "Enable parent delete for child_badges" ON child_badges
  FOR DELETE USING (
    (SELECT parent_id FROM children WHERE id = child_badges.child_id) IN (auth.jwt() ->> 'email', (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()))
  );
