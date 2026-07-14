-- Clean up any parent profiles that don't have a matching auth.users row
DELETE FROM parent_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Ensure the foreign key has ON DELETE CASCADE (in case it was manually created without it)
ALTER TABLE parent_profiles
DROP CONSTRAINT IF EXISTS parent_profiles_user_id_fkey,
ADD CONSTRAINT parent_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
