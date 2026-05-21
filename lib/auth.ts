import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { getSupabase, isSupabaseConfigured, resetSupabaseClient } from "./supabase";

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
      `No se pudo crear el perfil (${error.message}). Si usas Firebase, ejecuta supabase/firebase-uid-migration.sql.`
    );
  }
}

/** Tras login Firebase: perfil en BD + JWT con claim role (refrescar token). */
export async function syncFirebaseUserWithDatabase(
  firebaseUser: { uid: string; displayName: string | null; email: string | null }
) {
  await ensureUserProfile(
    firebaseUser.uid,
    firebaseUser.displayName ?? firebaseUser.email
  );
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
}

export async function signOutSupabase() {
  resetSupabaseClient();
  const supabase = getSupabase();
  if (!supabase) return;
  if (!isFirebaseConfigured()) {
    await supabase.auth.signOut();
  }
}

/** Comprueba que hay usuario y perfil listos para leer/escribir. */
export async function ensureSupabaseSession() {
  if (!isSupabaseConfigured()) return null;

  if (isFirebaseConfigured()) {
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser) {
      throw new Error("Debes iniciar sesión para continuar.");
    }
    await syncFirebaseUserWithDatabase(firebaseUser);
    return { user: { id: firebaseUser.uid } };
  }

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
  if (isFirebaseConfigured()) {
    return getFirebaseAuth().currentUser?.uid ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
