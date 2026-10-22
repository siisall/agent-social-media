-- Store app profile fields in an app-owned table linked to InsForge auth.users.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text NOT NULL UNIQUE,
  image_url text,
  created_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Backfill profiles for auth accounts that existed before this table was added.
INSERT INTO public.user_profiles (user_id, name, email, image_url)
SELECT
  id,
  COALESCE(NULLIF(profile->>'name', ''), split_part(email, '@', 1)),
  email,
  COALESCE(
    NULLIF(profile->>'avatar_url', ''),
    NULLIF(profile->>'picture', '')
  )
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.user_profiles TO authenticated;

DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own
  ON public.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Every first-time auth signup creates or refreshes its app profile.
CREATE OR REPLACE FUNCTION public.sync_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Retain the existing lightweight users row for app compatibility.
  INSERT INTO public.users (name, email)
  VALUES (
    COALESCE(NULLIF(NEW.profile->>'name', ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO public.user_profiles (user_id, name, email, image_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.profile->>'name', ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(
      NULLIF(NEW.profile->>'avatar_url', ''),
      NULLIF(NEW.profile->>'picture', '')
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    image_url = COALESCE(EXCLUDED.image_url, public.user_profiles.image_url);

  RETURN NEW;
END;
$$;
