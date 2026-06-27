-- Migration: Enable Realtime for family_messages

ALTER PUBLICATION supabase_realtime ADD TABLE family_messages;
