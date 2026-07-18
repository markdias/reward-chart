-- Add tour_seen to parent_profiles
ALTER TABLE parent_profiles ADD COLUMN IF NOT EXISTS tour_seen BOOLEAN DEFAULT FALSE;

-- Add tour_seen to children
ALTER TABLE children ADD COLUMN IF NOT EXISTS tour_seen BOOLEAN DEFAULT FALSE;
