-- Fix RLS policy to allow kicking users out of the family (changing their family_id)
DROP POLICY IF EXISTS "Allow authenticated update parent_profiles" ON parent_profiles;

CREATE POLICY "Allow authenticated update parent_profiles" ON parent_profiles
FOR UPDATE TO authenticated 
USING (
  auth.uid() = user_id OR family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  -- We allow the update to proceed as long as the USING clause passed. 
  -- Without this explicitly set, Postgres uses the USING clause as the WITH CHECK clause, 
  -- which fails when we change another user's family_id to something else.
  true
);
