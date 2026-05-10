-- Fix infinite RLS recursion (error 42P17)
--
-- All policies that did `select user_id from campaign_members where campaign_id = X`
-- inside a policy caused infinite recursion: the outer table's RLS evaluation
-- triggered campaign_members' RLS, which triggered a new check on the outer table,
-- and so on. The fix is a security definer function that reads campaign_members
-- with the function owner's privileges, bypassing the RLS loop entirely.

create or replace function public.is_campaign_member(p_campaign_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.campaign_members
    where campaign_id = p_campaign_id
      and user_id = auth.uid()
  );
$$;

-- campaigns
drop policy if exists "Players can view their campaigns" on public.campaigns;
create policy "Players can view their campaigns"
  on public.campaigns for select
  using (is_campaign_member(id));

drop policy if exists "Members can update campaign" on public.campaigns;
create policy "Members can update campaign"
  on public.campaigns for update
  using (is_campaign_member(id));

-- characters
drop policy if exists "Players can view characters in their campaign" on public.characters;
create policy "Players can view characters in their campaign"
  on public.characters for select
  using (is_campaign_member(campaign_id));

-- messages
drop policy if exists "Members can view campaign messages" on public.messages;
create policy "Members can view campaign messages"
  on public.messages for select
  using (is_campaign_member(campaign_id));

drop policy if exists "Members can insert messages" on public.messages;
create policy "Members can insert messages"
  on public.messages for insert
  with check (is_campaign_member(campaign_id));

-- combat_encounters
drop policy if exists "Members can view combat" on public.combat_encounters;
create policy "Members can view combat"
  on public.combat_encounters for select
  using (is_campaign_member(campaign_id));

drop policy if exists "Members can insert combat" on public.combat_encounters;
create policy "Members can insert combat"
  on public.combat_encounters for insert
  with check (is_campaign_member(campaign_id));

drop policy if exists "Members can update combat" on public.combat_encounters;
create policy "Members can update combat"
  on public.combat_encounters for update
  using (is_campaign_member(campaign_id));

-- npcs
drop policy if exists "Members can view NPCs" on public.npcs;
create policy "Members can view NPCs"
  on public.npcs for select
  using (is_campaign_member(campaign_id));

drop policy if exists "Members can insert npcs" on public.npcs;
create policy "Members can insert npcs"
  on public.npcs for insert
  with check (is_campaign_member(campaign_id));

-- quests
drop policy if exists "Members can view quests" on public.quests;
create policy "Members can view quests"
  on public.quests for select
  using (is_campaign_member(campaign_id));

drop policy if exists "Members can insert quests" on public.quests;
create policy "Members can insert quests"
  on public.quests for insert
  with check (is_campaign_member(campaign_id));

-- world_memory_summaries
drop policy if exists "Members can view summaries" on public.world_memory_summaries;
create policy "Members can view summaries"
  on public.world_memory_summaries for select
  using (is_campaign_member(campaign_id));
