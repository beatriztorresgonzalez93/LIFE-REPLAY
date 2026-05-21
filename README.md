# Life Replay (React Native + Expo)

App móvil donde cada día guardas **1 foto, 1 pensamiento, 1 canción y 1 emoción**. Tus días se agrupan en **temporadas** y la IA puede escribir la conclusión cinematográfica de cada una.

## Desplegar en Vercel (versión web)

> Vercel publica la **versión web** de la app. El móvil con QR sigue siendo con **Expo Go** (`npx expo start`).

1. Entra en [vercel.com](https://vercel.com) y abre tu proyecto (o **Add New → Project**).
2. En **Git Repository**, conecta GitHub si aún no lo tienes.
3. Importa el repo **beatriztorresgonzalez93/LIFE-REPLAY**.
4. Vercel detectará `vercel.json` automáticamente:
   - **Build command:** `npm run build:web`
   - **Output directory:** `dist`
5. Pulsa **Deploy**.

Si el proyecto en Vercel **ya existe** pero no está unido al repo:

1. Proyecto → **Settings** → **Git**
2. **Connect Git Repository** → elige `LIFE-REPLAY`
3. Rama: `main` → **Save**
4. **Deployments** → **Redeploy** (o haz un `git push` nuevo)

## Ver en el móvil con QR (Expo Go)

1. Instala **Expo Go** en tu móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779))
2. En el proyecto:

```bash
npm install
npx expo start
```

3. Escanea el **código QR** que aparece en la terminal con Expo Go (Android) o la cámara (iOS)
4. La app se abrirá en tu teléfono

> Usa la misma red Wi‑Fi en el PC y el móvil. Si no conecta, prueba `npx expo start --tunnel`.

## Funcionalidades

- **Inicio** — temporadas y episodios recientes
- **Nuevo episodio** — formulario diario completo
- **Foto del día** — **hacer foto con la cámara** o **subir desde galería**
- **Detalle de episodio** — vista cinematográfica
- **Temporada** — episodios del año + botón **Generar con IA**
- **Datos locales** — AsyncStorage con 5 episodios de ejemplo

## Supabase (base de datos + fotos)

### 1. Tablas (si no lo hiciste)

SQL Editor → pega y ejecuta `supabase/schema.sql`.

### 2. Bucket de fotos

SQL Editor → ejecuta **`supabase/storage.sql`**.

### 3. Auth (obligatorio para la base de datos)

1. En Supabase → **Authentication** → **Providers** → **Anonymous** → activar **Enable**
2. SQL Editor → ejecuta **`supabase/auth.sql`**

Sin el paso 3 la app no puede escribir en las tablas `episodes` / `seasons`.

### 4. Variables de entorno

Copia `.env.example` a `.env` y rellena (Project Settings → API en Supabase):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**En Vercel (obligatorio para que funcione la web):**

1. Proyecto → **Settings** → **Environment Variables**
2. Añade **exactamente** estos nombres (con `EXPO_PUBLIC_`):
   - `EXPO_PUBLIC_SUPABASE_URL` = tu Project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = tu clave **anon public** (`eyJ...`)
3. Marca **Production**, **Preview** y **Development**
4. **Redeploy** (Deployments → ⋯ → Redeploy) — el build ejecuta `embed-env` y mete las claves en el JS

En los **logs del build** en Vercel debe aparecer:
`[embed-env] URL: https://...` y `[embed-env] Anon key: ok`
Si sale `(vacía)`, las variables no están en Vercel.

> Tras cambiar variables: **Deployments → Redeploy** obligatorio.

### Build en Vercel (ajusta como en la captura)

En **Settings → Build & Development**:

| Campo | Valor |
|--------|--------|
| Build Command | `npm run build:web` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Activa **Override** en los tres si no coinciden. Debe coincidir con `vercel.json`.

Tras guardar, haz **Redeploy**. Abre la consola del navegador (F12): debe salir `configurado: true` en `[Life Replay] Supabase en web`.

### Fotos en Storage

1. Ejecuta `supabase/storage.sql`
2. **Authentication → Providers → Anonymous → Enable**
3. Si la subida falla, en SQL Editor ejecuta también la política al final de `storage.sql` (bloque `Dev anon upload`, solo si hace falta)

Reinicia Expo después de cambiar `.env`: `npx expo start -c`.

## Stack

- Expo SDK 54 + Expo Router
- React Native
- TypeScript
- AsyncStorage + **Supabase** (PostgreSQL + Storage + auth anónima)
- expo-image-picker (cámara + galería)

## Estructura

```
app/           # Pantallas (Expo Router)
components/    # UI, cards, PhotoPicker
hooks/         # useEpisodes
lib/           # tipos, datos, IA mock, temporadas
supabase/      # schema.sql, storage.sql
```

## Próximos pasos

1. Login con email/Google (opcional, además del anónimo)
2. API real de IA (OpenAI / Gemini)
