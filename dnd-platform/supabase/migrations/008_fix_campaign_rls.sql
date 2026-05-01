-- Drop the old restrictive SELECT policy that excluded DMs
drop policy if exists "Players can view their campaigns" on public.campaigns;

-- New policy: visible if you're a member OR the DM
create policy "Members and DMs can view campaigns"
  on public.campaigns for select
  using (
    auth.uid() = dm_user_id
    OR
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = id
    )
  );

-- Also fix the campaign_members SELECT policy so DMs can see all members of their campaigns
drop policy if exists "Members can view campaign members" on public.campaign_members;

create policy "Members and DMs can view campaign members"
  on public.campaign_members for select
  using (
    auth.uid() = user_id
    OR
    auth.uid() in (
      select dm_user_id from public.campaigns where id = campaign_id and dm_user_id is not null
    )
  );

-- Backfill: ensure every campaign's dm_user_id is also in campaign_members
-- so queries that join through campaign_members work too
insert into public.campaign_members (campaign_id, user_id)
  select id, dm_user_id
  from public.campaigns
  where dm_user_id is not null
on conflict (campaign_id, user_id) do nothing;
