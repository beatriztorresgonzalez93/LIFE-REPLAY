-- Life Replay — Storage bucket para fotos de episodios
-- Ejecuta esto en Supabase → SQL Editor (después de schema.sql)

-- 1) Crear el bucket (público = las URLs de foto se ven en la app sin login extra)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'episode-photos',
  'episode-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Políticas de acceso

-- Cualquiera puede VER las fotos (bucket público)
create policy "Public read episode photos"
on storage.objects for select
to public
using (bucket_id = 'episode-photos');

-- Usuarios autenticados suben solo a su carpeta: {user_id}/nombre.jpg
create policy "Auth upload own episode photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Auth update own episode photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Auth delete own episode photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'episode-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3) OPCIONAL — solo mientras no tengas login en la app (desarrollo)
-- Descomenta si quieres probar subidas sin auth. BORRA en producción.
--
-- create policy "Dev anon upload episode photos"
-- on storage.objects for insert
-- to anon
-- with check (bucket_id = 'episode-photos');
