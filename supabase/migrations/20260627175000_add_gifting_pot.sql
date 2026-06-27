-- Add Gifting Pot columns to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS gifting_pot numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifting_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gifting_unlock_seen boolean DEFAULT false;

-- Drop and recreate gifting_requests table to fix schema mismatch
DROP TABLE IF EXISTS gifting_requests CASCADE;

CREATE TABLE gifting_requests (
    id text PRIMARY KEY,
    child_id text REFERENCES children(id) ON DELETE CASCADE,
    family_id text NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('charity', 'sibling')),
    sibling_id text REFERENCES children(id) ON DELETE CASCADE,
    charity_name text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE gifting_requests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for gifting_requests
DROP POLICY IF EXISTS "Parents can manage their family gifting requests" ON gifting_requests;
CREATE POLICY "Parents can manage their family gifting requests"
    ON gifting_requests
    FOR ALL
    USING (
        family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
    );

-- Force PostgREST schema cache reload to fix 400 errors immediately
NOTIFY pgrst, 'reload schema';

-- Enable Realtime for gifting_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'gifting_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE gifting_requests;
  END IF;
END
$$;
