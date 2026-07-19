-- Add beta tester flag to parent_profiles
ALTER TABLE parent_profiles
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    feature_key TEXT PRIMARY KEY,
    is_enabled_for_all BOOLEAN NOT NULL DEFAULT false,
    is_enabled_for_beta BOOLEAN NOT NULL DEFAULT false,
    description TEXT
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so login pages can see flags before auth)
CREATE POLICY "Allow public read access to feature_flags"
    ON feature_flags FOR SELECT
    USING (true);

-- Insert core features
INSERT INTO feature_flags (feature_key, is_enabled_for_all, is_enabled_for_beta, description)
VALUES 
    ('google_login', false, false, 'Enable Google Login buttons'),
    ('apple_login', false, false, 'Enable Apple Login buttons'),
    ('beta_opt_in', true, true, 'Allow users to opt-in to the beta program in their settings')
ON CONFLICT (feature_key) DO UPDATE SET
    is_enabled_for_all = EXCLUDED.is_enabled_for_all,
    is_enabled_for_beta = EXCLUDED.is_enabled_for_beta,
    description = EXCLUDED.description;
