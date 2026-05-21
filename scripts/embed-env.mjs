/**
 * Escribe credenciales en el bundle (Vercel las tiene en build time).
 * Se ejecuta antes de `expo export --platform web`.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env") });

const pick = (keys) => {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return "";
};

const supabaseUrl = pick(["EXPO_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
const anonKey = pick(["EXPO_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"]);

const firebase = {
  apiKey: pick(["EXPO_PUBLIC_FIREBASE_API_KEY"]),
  authDomain: pick(["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"]),
  projectId: pick(["EXPO_PUBLIC_FIREBASE_PROJECT_ID"]),
  storageBucket: pick(["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"]),
  messagingSenderId: pick(["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]),
  appId: pick(["EXPO_PUBLIC_FIREBASE_APP_ID"]),
};

const outPath = join(root, "lib", "env.generated.ts");
const content = `// Generado por scripts/embed-env.mjs — no editar a mano
export const EMBEDDED_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
export const EMBEDDED_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};
export const EMBEDDED_FIREBASE_API_KEY = ${JSON.stringify(firebase.apiKey)};
export const EMBEDDED_FIREBASE_AUTH_DOMAIN = ${JSON.stringify(firebase.authDomain)};
export const EMBEDDED_FIREBASE_PROJECT_ID = ${JSON.stringify(firebase.projectId)};
export const EMBEDDED_FIREBASE_STORAGE_BUCKET = ${JSON.stringify(firebase.storageBucket)};
export const EMBEDDED_FIREBASE_MESSAGING_SENDER_ID = ${JSON.stringify(firebase.messagingSenderId)};
export const EMBEDDED_FIREBASE_APP_ID = ${JSON.stringify(firebase.appId)};
`;

writeFileSync(outPath, content, "utf8");

console.log("[embed-env] Supabase URL:", supabaseUrl ? `${supabaseUrl.slice(0, 40)}…` : "(vacía)");
console.log("[embed-env] Supabase anon:", anonKey ? "ok" : "(vacía)");
console.log("[embed-env] Firebase:", firebase.projectId ? firebase.projectId : "(vacío)");
