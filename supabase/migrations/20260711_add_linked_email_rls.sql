-- Migration: Strict Child Isolation and Linked Email

-- 1. Add linked_email to children
ALTER TABLE children
ADD COLUMN IF NOT EXISTS linked_email TEXT;

-- 2. Strict RLS for children table
-- Allow child to only read their own row
DROP POLICY IF EXISTS "Enable read for linked child" ON children;
CREATE POLICY "Enable read for linked child"
  ON children FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = children.id));

-- Allow child to update their own row (for points, savings, pet food, etc.)
DROP POLICY IF EXISTS "Enable update for linked child" ON children;
CREATE POLICY "Enable update for linked child"
  ON children FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = children.id));

-- 3. Strict RLS for tasks
DROP POLICY IF EXISTS "Enable read tasks for linked child" ON tasks;
CREATE POLICY "Enable read tasks for linked child"
  ON tasks FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = tasks.child_id));

-- 4. Strict RLS for rewards
DROP POLICY IF EXISTS "Enable read rewards for linked child" ON rewards;
CREATE POLICY "Enable read rewards for linked child"
  ON rewards FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = rewards.child_id));

-- 5. Strict RLS for completions
DROP POLICY IF EXISTS "Enable read completions for linked child" ON completions;
CREATE POLICY "Enable read completions for linked child"
  ON completions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = completions.child_id));

DROP POLICY IF EXISTS "Enable insert completions for linked child" ON completions;
CREATE POLICY "Enable insert completions for linked child"
  ON completions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = completions.child_id));

-- 6. Strict RLS for reward_redemptions
DROP POLICY IF EXISTS "Enable read reward_redemptions for linked child" ON reward_redemptions;
CREATE POLICY "Enable read reward_redemptions for linked child"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = reward_redemptions.child_id));

DROP POLICY IF EXISTS "Enable insert reward_redemptions for linked child" ON reward_redemptions;
CREATE POLICY "Enable insert reward_redemptions for linked child"
  ON reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = reward_redemptions.child_id));

-- 7. Strict RLS for child_badges
DROP POLICY IF EXISTS "Enable read child_badges for linked child" ON child_badges;
CREATE POLICY "Enable read child_badges for linked child"
  ON child_badges FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM child_profiles WHERE child_id = child_badges.child_id));
