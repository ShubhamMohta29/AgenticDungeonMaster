create type dm_mode as enum ('ai', 'human');
create type campaign_status as enum ('active', 'paused', 'completed');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  setting text not null default 'classic high fantasy',
  dm_mode dm_mode not null default 'ai',
  dm_user_id uuid references public.users(id) on delete set null,
  current_scene text not null default 'The adventure begins...',
  world_state jsonb not null default '{}',
  session_count int not null default 0,
  status campaign_status not null default 'active',
  invite_code text unique default substring(gen_random_uuid()::text, 1, 8),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table public.campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(campaign_id, user_id)
);

alter table public.campaign_members enable row level security;

create policy "Members can view campaign members"
  on public.campaign_members for select
  using (auth.uid() = user_id);

-- RLS
alter table public.campaigns enable row level security;

create policy "Players can view their campaigns"
  on public.campaigns for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = id
    )
  );

create policy "DM can update their campaign"
  on public.campaigns for update
  using (auth.uid() = dm_user_id);