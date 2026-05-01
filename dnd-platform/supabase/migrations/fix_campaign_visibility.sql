-- =============================================================
-- STEP 1 – Diagnose: see what's in campaigns vs campaign_members
-- Run this first to understand the gap
-- =============================================================
SELECT
  c.id,
  c.name,
  c.dm_mode,
  c.dm_user_id,
  c.created_at,
  cm.user_id AS member_id
FROM campaigns c
LEFT JOIN campaign_members cm ON cm.campaign_id = c.id
ORDER BY c.created_at;


-- =============================================================
-- STEP 2 – Backfill: if you know your user ID, paste it below
-- Run:  SELECT id FROM auth.users;  to find your user ID first
-- =============================================================
-- Replace 'YOUR-USER-UUID-HERE' with your actual user id
DO $$
DECLARE
  v_user_id uuid := 'YOUR-USER-UUID-HERE';
BEGIN
  -- Insert all campaigns where dm_user_id matches the user
  INSERT INTO public.campaign_members (campaign_id, user_id)
  SELECT id, v_user_id
  FROM public.campaigns
  WHERE dm_user_id = v_user_id
  ON CONFLICT (campaign_id, user_id) DO NOTHING;

  RAISE NOTICE 'Backfilled DM campaigns for user %', v_user_id;
END $$;


-- =============================================================
-- STEP 3 – Fix RLS to allow SELECT when dm_user_id matches
-- (Safe to re-run — idempotent)
-- =============================================================
DROP POLICY IF EXISTS "Players can view their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Members and DMs can view campaigns" ON public.campaigns;

CREATE POLICY "Members and DMs can view campaigns"
  ON public.campaigns FOR SELECT
  USING (
    auth.uid() = dm_user_id
    OR auth.uid() IN (
      SELECT user_id FROM public.campaign_members WHERE campaign_id = id
    )
  );
