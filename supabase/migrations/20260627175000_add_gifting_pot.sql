-- Add Gifting Pot columns to children table
ALTER TABLE children
ADD COLUMN gifting_pot numeric DEFAULT 0,
ADD COLUMN gifting_unlocked boolean DEFAULT false,
ADD COLUMN gifting_unlock_seen boolean DEFAULT false;

-- Create gifting_requests table
CREATE TABLE gifting_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id uuid REFERENCES children(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES parent_profiles(user_id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('charity', 'sibling')),
    sibling_id uuid REFERENCES children(id) ON DELETE CASCADE,
    charity_name text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE gifting_requests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for gifting_requests
CREATE POLICY "Parents can manage their family gifting requests"
    ON gifting_requests
    FOR ALL
    USING (
        parent_id IN (
            SELECT user_id FROM parent_profiles 
            WHERE family_id = (
                SELECT family_id FROM parent_profiles WHERE user_id = auth.uid()
            )
        )
    );
