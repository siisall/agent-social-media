-- Properly remove the UNIQUE constraint on campaign.user_id
-- This allows multiple campaigns per user

ALTER TABLE public.campaign DROP CONSTRAINT IF EXISTS campaign_user_id_key;

-- If the constraint name is different (auto-generated), explicitly alter the column
-- Remove the UNIQUE constraint by dropping and recreating the column
ALTER TABLE public.campaign
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;
