/**
 * Escribe credenciales de Supabase en el bundle (Vercel las tiene en build time).
 * Se ejecuta antes de `expo export --platform web`.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env") });

const url = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  ""
).trim();

const anonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  ""
).trim();

const outPath = join(root, "lib", "env.generated.ts");
const content = `// Generado por scripts/embed-env.mjs — no editar a mano
export const EMBEDDED_SUPABASE_URL = ${JSON.stringify(url)};
export const EMBEDDED_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};
`;

writeFileSync(outPath, content, "utf8");

console.log("[embed-env] URL:", url ? `${url.slice(0, 40)}…` : "(vacía — revisa variables en Vercel)");
console.log("[embed-env] Anon key:", anonKey ? "ok" : "(vacía)");
