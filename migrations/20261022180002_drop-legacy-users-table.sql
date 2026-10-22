-- Remove the obsolete legacy profile table. The empty table was dropped with
-- its owner role; IF EXISTS records this state change without requiring CASCADE.
DROP TABLE IF EXISTS public.users;
