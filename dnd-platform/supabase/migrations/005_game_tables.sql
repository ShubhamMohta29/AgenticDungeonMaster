-- Combat encounters
create type combat_status as enum ('active', 'completed');

create table public.combat_encounters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  status combat_status not null default 'active',
  round int not null default 1,
  turn_order jsonb not null default '[]',
  current_turn_index int not null default 0,
  monsters jsonb not null default '[]',
  loot_table jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.combat_encounters enable row level security;

create policy "Members can view combat"
  on public.combat_encounters for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = combat_encounters.campaign_id
    )
  );

-- NPCs
create type npc_disposition as enum ('friendly', 'neutral', 'hostile', 'unknown');

create table public.npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text,
  disposition npc_disposition not null default 'unknown',
  location text,
  notes text,
  has_quest bool not null default false,
  is_alive bool not null default true,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.npcs enable row level security;

create policy "Members can view NPCs"
  on public.npcs for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = npcs.campaign_id
    )
  );

-- Quests
create type quest_status as enum ('active', 'completed', 'failed', 'hidden');

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  description text,
  status quest_status not null default 'hidden',
  objectives jsonb not null default '[]',
  xp_reward int not null default 0,
  loot_reward jsonb default '[]',
  giver_npc_id uuid references public.npcs(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.quests enable row level security;

create policy "Members can view quests"
  on public.quests for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = quests.campaign_id
    )
  );

-- World memory summaries
create type summary_type as enum ('session', 'arc', 'full');

create table public.world_memory_summaries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  summary_type summary_type not null default 'session',
  content text not null,
  message_range_start uuid references public.messages(id) on delete set null,
  message_range_end uuid references public.messages(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.world_memory_summaries enable row level security;

create policy "Members can view summaries"
  on public.world_memory_summaries for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = world_memory_summaries.campaign_id
    )
  );