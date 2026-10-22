-- Keep the app's public users table in sync for every new InsForge auth account.
-- This runs for both email signups and Google OAuth signups.
CREATE OR REPLACE FUNCTION public.sync_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.users (name, email)
  VALUES (
    COALESCE(NULLIF(NEW.profile->>'name', ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_public_user_after_auth_signup ON auth.users;

CREATE TRIGGER sync_public_user_after_auth_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_new_auth_user_profile();
