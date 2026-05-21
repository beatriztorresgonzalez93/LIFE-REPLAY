import { getSupabase, isSupabaseConfigured } from "./supabase";

/** Crea el perfil si falta (seasons/episodes lo exigen por FK). */
export async function ensureUserProfile(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: "Usuario Life Replay",
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(
      `No se pudo crear el perfil (${error.message}). Ejecuta supabase/auth.sql en el SQL Editor.`
    );
  }
}

/** Inicia sesión anónima si hace falta (necesario para escribir en la BD). */
export async function ensureSupabaseSession() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    await ensureUserProfile(sessionData.session.user.id);
    return sessionData.session;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Auth: ${error.message}`);
  }

  if (data.user) {
    await ensureUserProfile(data.user.id);
  }

  return data.session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
