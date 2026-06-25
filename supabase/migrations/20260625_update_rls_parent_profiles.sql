-- Migration: Update RLS for parent_profiles to allow family sharing updates

DROP POLICY IF EXISTS "Allow authenticated update parent_profiles" ON parent_profiles;

CREATE POLICY "Allow authenticated update parent_profiles" ON parent_profiles
FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
);
