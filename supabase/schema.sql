-- Life Replay — Supabase schema
-- Run in Supabase SQL Editor when connecting the backend.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  year int not null,
  title text not null default '',
  synopsis text not null default '',
  conclusion text,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, year)
);

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  episode_number int not null,
  date date not null default current_date,
  title text not null,
  thought text not null,
  song_title text not null,
  song_artist text not null,
  song_url text,
  emotion text not null check (
    emotion in (
      'joy','sadness','anxiety','love','anger','calm','hope','nostalgia',
      'gratitude','pride','fear','loneliness','surprise','tiredness'
    )
  ),
  photo_url text not null,
  latitude numeric,
  longitude numeric,
  location_name text,
  created_at timestamptz default now(),
  unique (season_id, episode_number)
);

alter table profiles enable row level security;
alter table seasons enable row level security;
alter table episodes enable row level security;

create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage own seasons"
  on seasons for all using (auth.uid() = user_id);

create policy "Users manage own episodes"
  on episodes for all using (auth.uid() = user_id);
