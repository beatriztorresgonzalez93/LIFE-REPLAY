import { getSupabase, isSupabaseConfigured } from "./supabase";

/** Crea el perfil si falta (seasons/episodes lo exigen por FK). */
export async function ensureUserProfile(
  userId: string,
  displayName?: string | null
) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  const name = displayName?.trim() || "Usuario Life Replay";

  if (existing) {
    await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", userId);
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: name,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(
      `No se pudo crear el perfil (${error.message}). Ejecuta supabase/auth.sql.`
    );
  }
}

/** Requiere sesión de Supabase Auth (email/contraseña u otro proveedor). */
export async function ensureSupabaseSession() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    await ensureUserProfile(
      sessionData.session.user.id,
      sessionData.session.user.user_metadata?.display_name ??
        sessionData.session.user.email
    );
    return sessionData.session;
  }

  throw new Error("Debes iniciar sesión para continuar.");
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
