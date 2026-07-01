DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'parent_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE parent_profiles;
  END IF;
END $$;
