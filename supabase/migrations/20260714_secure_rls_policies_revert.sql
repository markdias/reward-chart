-- Migration: Revert Secure RLS Policies
-- Description: Drops the strict parent policies and restores the public access policies.

-- 1. Drop secure parent policies
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


-- 2. Restore permissive public policies
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

CREATE POLICY "Allow public select for child_badges" ON child_badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert for child_badges" ON child_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for child_badges" ON child_badges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for child_badges" ON child_badges FOR DELETE USING (true);
