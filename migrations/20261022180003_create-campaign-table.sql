-- One campaign per authenticated user, with row-level access limited to its owner.
CREATE TABLE IF NOT EXISTS public.campaign (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  icon text NOT NULL,
  office text NOT NULL CHECK (office IN ('/offices/modern-office.png', '/offices/wooden-office.png')),
  created_at timestamp without time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON TABLE public.campaign TO authenticated;

DROP POLICY IF EXISTS campaign_select_own ON public.campaign;
CREATE POLICY campaign_select_own
  ON public.campaign
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS campaign_insert_own ON public.campaign;
CREATE POLICY campaign_insert_own
  ON public.campaign
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
