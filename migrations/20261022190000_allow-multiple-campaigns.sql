ALTER TABLE public.campaign DROP CONSTRAINT IF EXISTS campaign_user_id_key;
GRANT UPDATE ON TABLE public.campaign TO authenticated;
DROP POLICY IF EXISTS campaign_update_own ON public.campaign;
CREATE POLICY campaign_update_own
  ON public.campaign
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
