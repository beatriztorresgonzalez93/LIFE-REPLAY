-- Geolocalización en episodios (ejecutar una vez en SQL Editor si ya tenías el schema)

alter table public.episodes
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists location_name text;
