/**
 * Escribe credenciales de Supabase en el bundle (Vercel las tiene en build time).
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
const groqKey = pick(["EXPO_PUBLIC_GROQ_API_KEY", "GROQ_API_KEY"]);

const outPath = join(root, "lib", "env.generated.ts");
const content = `// Generado por scripts/embed-env.mjs — no editar a mano
export const EMBEDDED_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
export const EMBEDDED_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};
export const EMBEDDED_GROQ_API_KEY = ${JSON.stringify(groqKey)};
`;

writeFileSync(outPath, content, "utf8");

console.log("[embed-env] Supabase URL:", supabaseUrl ? `${supabaseUrl.slice(0, 40)}…` : "(vacía)");
console.log("[embed-env] Supabase anon:", anonKey ? "ok" : "(vacía)");
console.log("[embed-env] Groq API key:", groqKey ? "ok" : "(vacía)");
