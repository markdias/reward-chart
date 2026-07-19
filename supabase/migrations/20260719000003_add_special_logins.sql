-- Add has_special_logins flag to parent_profiles
ALTER TABLE parent_profiles
ADD COLUMN IF NOT EXISTS has_special_logins BOOLEAN DEFAULT false;
