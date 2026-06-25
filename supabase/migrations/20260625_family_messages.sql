-- Migration: Create family_messages table for inter-parent messaging

CREATE TABLE IF NOT EXISTS family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means broadcast to everyone in the family
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;

-- Allow reading messages for your own family
CREATE POLICY "Allow authenticated read family_messages" ON family_messages
FOR SELECT TO authenticated USING (
  family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
);

-- Allow inserting messages into your own family
CREATE POLICY "Allow authenticated insert family_messages" ON family_messages
FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND
  family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
);

-- Allow updating messages in your own family (e.g. marking as read)
CREATE POLICY "Allow authenticated update family_messages" ON family_messages
FOR UPDATE TO authenticated USING (
  family_id = (SELECT family_id FROM parent_profiles WHERE user_id = auth.uid())
);
