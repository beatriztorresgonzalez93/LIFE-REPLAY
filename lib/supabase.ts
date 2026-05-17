import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export const EPISODE_PHOTOS_BUCKET = "episode-photos";
