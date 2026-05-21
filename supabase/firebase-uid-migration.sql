-- Firebase Auth: los UID son texto (ej. "kR7Xg2..."), no UUID.
-- Ejecutar UNA VEZ en SQL Editor. Si falló antes a medias, este script es idempotente en políticas/FK.

-- 1) Quitar políticas RLS que usan id / user_id
drop policy if exists "Users manage own profile" on profiles;
drop policy if exists "Users manage own seasons" on seasons;
drop policy if exists "Users manage own episodes" on episodes;

-- 2) Quitar FKs que impiden cambiar el tipo
alter table if exists episodes drop constraint if exists episodes_user_id_fkey;
alter table if exists seasons drop constraint if exists seasons_user_id_fkey;
alter table if exists profiles drop constraint if exists profiles_id_fkey;

-- 3) Pasar IDs de usuario a text (Firebase UID)
alter table profiles alter column id drop default;
alter table profiles alter column id type text using id::text;

alter table seasons alter column user_id type text using user_id::text;
alter table episodes alter column user_id type text using user_id::text;

-- 4) Volver a enlazar tablas (sin auth.users: login es Firebase)
alter table seasons
  add constraint seasons_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table episodes
  add constraint episodes_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

-- 5) Políticas RLS (auth.uid()::text para JWT de Firebase)
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

create policy "Users manage own seasons"
  on seasons for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users manage own episodes"
  on episodes for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
