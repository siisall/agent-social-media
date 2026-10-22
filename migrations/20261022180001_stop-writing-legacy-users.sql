-- Keep new auth accounts in user_profiles only. The existing auth trigger
-- already calls this function, so no trigger replacement is needed.
CREATE OR REPLACE FUNCTION public.sync_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
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
