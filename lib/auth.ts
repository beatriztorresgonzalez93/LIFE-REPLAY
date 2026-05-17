import { getSupabase, isSupabaseConfigured } from "./supabase";

/** Inicia sesión anónima si hace falta (necesario para escribir en la BD). */
export async function ensureSupabaseSession() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Auth: ${error.message}`);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: "Usuario Life Replay",
    });
  }

  return data.session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
