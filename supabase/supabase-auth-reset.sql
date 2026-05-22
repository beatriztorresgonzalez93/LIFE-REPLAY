-- Políticas RLS para Supabase Auth (email/contraseña, etc.)
-- Ejecutar después de schema.sql, storage.sql y auth.sql

-- Políticas de tablas (auth.uid() = UUID de Supabase Auth)
drop policy if exists "Users manage own profile" on profiles;
drop policy if exists "Users manage own seasons" on seasons;
drop policy if exists "Users manage own episodes" on episodes;

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

-- Storage (fotos en bucket episode-photos)
drop policy if exists "Auth upload own episode photos" on storage.objects;
drop policy if exists "Auth update own episode photos" on storage.objects;
drop policy if exists "Auth delete own episode photos" on storage.objects;
drop policy if exists "Firebase upload own episode photos" on storage.objects;
drop policy if exists "Firebase update own episode photos" on storage.objects;
drop policy if exists "Firebase delete own episode photos" on storage.objects;

create policy "Auth upload own episode photos"
on storage.objects for insert
to authenticated, anon
with check (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Auth update own episode photos"
on storage.objects for update
to authenticated, anon
using (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Auth delete own episode photos"
on storage.objects for delete
to authenticated, anon
using (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

notify pgrst, 'reload schema';
