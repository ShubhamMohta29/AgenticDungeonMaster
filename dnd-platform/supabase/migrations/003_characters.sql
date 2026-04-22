create table public.characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  race text not null,
  class text not null,
  subclass text,
  level int not null default 1,
  xp int not null default 0,
  hp int not null,
  max_hp int not null,
  temp_hp int not null default 0,
  ac int not null,
  speed int not null default 30,
  initiative_bonus int not null default 0,
  proficiency_bonus int not null default 2,
  ability_scores jsonb not null default '{"str":10,"dex":10,"con":10,"int":10,"wis":10,"cha":10}',
  saving_throws jsonb not null default '{"str":false,"dex":false,"con":false,"int":false,"wis":false,"cha":false}',
  skills jsonb not null default '{}',
  death_saves jsonb not null default '{"successes":0,"failures":0}',
  conditions jsonb not null default '[]',
  inventory jsonb not null default '[]',
  spells jsonb not null default '{"known":[],"prepared":[],"slots":{},"slot_max":{}}',
  features jsonb not null default '[]',
  backstory text,
  notes text,
  portrait_url text,
  is_alive bool not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.characters enable row level security;

create policy "Players can view characters in their campaign"
  on public.characters for select
  using (
    auth.uid() in (
      select user_id from public.campaign_members where campaign_id = characters.campaign_id
    )
  );

create policy "Players can update their own character"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Players can insert their own character"
  on public.characters for insert
  with check (auth.uid() = user_id);