-- Theme preference support for independent user/admin dashboard themes.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_preference_user TEXT
DEFAULT 'neo-brutalist'
CHECK (theme_preference_user IN (
  'neo-brutalist',
  'midnight-hacker',
  'vaporwave-dreams',
  'pastel-riot',
  'ghost-protocol'
));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_preference_admin TEXT
DEFAULT 'neo-brutalist'
CHECK (theme_preference_admin IN (
  'neo-brutalist',
  'midnight-hacker',
  'vaporwave-dreams',
  'pastel-riot',
  'ghost-protocol'
));

-- Backfill legacy data if an older single-column preference exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'theme_preference'
  ) THEN
    UPDATE profiles
    SET theme_preference_user = COALESCE(theme_preference_user, theme_preference),
        theme_preference_admin = COALESCE(theme_preference_admin, theme_preference);
  END IF;
END $$;

-- Users can update own theme preferences.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own theme preferences'
  ) THEN
    CREATE POLICY "Users can update own theme preferences"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;
