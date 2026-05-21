# Firebase Auth + Supabase

Life Replay usa **Firebase** para que el usuario inicie sesión (email/contraseña, Google en web) y **Supabase** para guardar episodios y fotos.

## 1. Firebase Console

1. [console.firebase.google.com](https://console.firebase.google.com) → crea o abre el proyecto.
2. **Authentication** → **Sign-in method**:
   - Activa **Correo electrónico/Contraseña**
   - (Opcional web) Activa **Google**
3. **Configuración del proyecto** → **Tus apps** → añade app **Web** → copia el objeto `firebaseConfig` a tu `.env` (variables `EXPO_PUBLIC_FIREBASE_*`).

## 2. Supabase: enlazar Firebase

En el menú nuevo de Supabase **no aparece “Third-party”** como ítem suelto. Usa una de estas rutas:

### Opción A — Enlace directo (la más fácil)

Sustituye `TU_PROJECT_REF` por el id de tu proyecto (en la URL de Supabase: `https://TU_PROJECT_REF.supabase.co` → en tu caso **`svmawejwonzlajcnpbzr`**):

`https://supabase.com/dashboard/project/svmawejwonzlajcnpbzr/auth/third-party`

Ahí añades integración **Firebase** y pones el Project ID: **`life-replay-88481`**.

### Opción B — Desde el menú

1. **Authentication** (barra lateral)
2. **CONFIGURATION** → **Sign In / Providers**
3. Arriba o en otra pestaña busca **Third-party auth** / **Third Party** (no confundir con Google/GitHub de “Providers”)
4. Si no lo ves, usa el enlace de la Opción A

### Qué rellenar

- **Firebase Project ID:** `life-replay-88481` (igual que `EXPO_PUBLIC_FIREBASE_PROJECT_ID`)
- Guardar / Enable

Sin este paso las peticiones a la base de datos fallarán (JWT no reconocido).

## 2b. IDs de usuario (obligatorio con Firebase)

Los UID de Firebase son texto, no UUID. En SQL Editor ejecuta **`supabase/firebase-uid-migration.sql`**.

## 2c. Claim `role: authenticated` (obligatorio)

Firebase debe enviar en el JWT el claim `role: authenticated` para que Supabase use el rol correcto.

Opciones (elige una):

1. **Firebase Functions (recomendado):** función `beforeUserCreated` / `beforeUserSignedIn` que devuelva `customClaims: { role: 'authenticated' }`. Ver [documentación Supabase](https://supabase.com/docs/guides/auth/third-party/firebase-auth#assign-the-role-custom-claim).
2. **Script admin** para usuarios ya creados (mismo enlace, sección admin SDK).

Tras configurarlo, el usuario debe **cerrar sesión y volver a entrar** (o `getIdToken(true)`) para refrescar el token.

## 3. Variables de entorno

Copia `.env.example` a `.env` y rellena Supabase + Firebase.

En **Vercel**, añade las mismas variables y haz **Redeploy**.

## 4. Comportamiento de la app

- Si hay variables Firebase → pantalla de **login/registro** obligatoria.
- Si no hay Firebase → sigue el modo anterior (sesión anónima en Supabase).
- Tras login, Supabase recibe el JWT de Firebase y tus datos quedan bajo tu `user_id`.

## 5. Google en móvil

Por ahora **Google solo en la versión web**. En Expo Go usa email/contraseña.
