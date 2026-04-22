create type message_type as enum ('narration', 'player_action', 'dice_roll', 'system', 'dm_whisper');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  type message_type not null,
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Critical index for performance - this query runs on every page load
create index messages_campaign_created
  on public.messages(campaign_id, created_at desc);

alter table public.messages enable row level security;

create policy "Members can view campaign messages"
  on public.messages for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = messages.campaign_id
    )
  );

create policy "Members can insert messages"
  on public.messages for insert
  with check (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = messages.campaign_id
    )
  );