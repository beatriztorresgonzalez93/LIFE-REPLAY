# Login con Supabase (email / contraseña)

## 1. Activar Email en Supabase

1. Dashboard → **Authentication** → **Providers**
2. **Email** → activar **Enable Email provider**
3. **User Signups** → **Allow new users to sign up** activado
4. Para pruebas: **Confirm email** desactivado (o confirma el enlace al registrarte)
5. Guarda

## 2. SQL (orden recomendado)

En **SQL Editor**, una vez por proyecto:

1. `schema.sql` — tablas
2. `storage.sql` — bucket `episode-photos`
3. `auth.sql` — perfil automático al registrarse
4. `supabase-auth-reset.sql` — políticas RLS tablas + Storage

## 3. Variables `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 4. App

- Pantalla **Entrar / Registro**
- Fotos en **Supabase Storage** (`episode-photos`)
- Cada usuario ve solo sus episodios (RLS)

## 5. Vercel

Mismas dos variables + Redeploy.
