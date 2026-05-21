-- Ejecutar una vez si ya tenías usuarios anónimos sin fila en profiles
-- (provoca: seasons_user_id_fkey al guardar en móvil)

insert into public.profiles (id, display_name)
select
  id,
  coalesce(raw_user_meta_data->>'display_name', 'Usuario Life Replay')
from auth.users
on conflict (id) do nothing;
