-- Migration: Add family_name to parent_profiles

ALTER TABLE parent_profiles ADD COLUMN IF NOT EXISTS family_name TEXT;
