-- Allow authenticated users to insert campaigns
create policy "Users can create campaigns"
  on public.campaigns for insert
  with check (auth.uid() is not null);

-- Allow authenticated users to insert campaign members
create policy "Users can join campaigns"
  on public.campaign_members for insert
  with check (auth.uid() = user_id);

-- Allow members to update their campaign
create policy "Members can update campaign"
  on public.campaigns for update
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = id
    )
  );

-- Allow members to insert messages
create policy "Members can insert npcs"
  on public.npcs for insert
  with check (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = npcs.campaign_id
    )
  );

-- Allow members to insert quests  
create policy "Members can insert quests"
  on public.quests for insert
  with check (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = quests.campaign_id
    )
  );

-- Allow members to insert combat encounters
create policy "Members can insert combat"
  on public.combat_encounters for insert
  with check (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = combat_encounters.campaign_id
    )
  );

-- Allow members to update combat encounters
create policy "Members can update combat"
  on public.combat_encounters for update
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = combat_encounters.campaign_id
    )
  );