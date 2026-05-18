import Constants from "expo-constants";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

function readConfig() {
  const url = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    extra?.supabaseUrl ??
    process.env.SUPABASE_URL ??
    ""
  ).trim();

  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    extra?.supabaseAnonKey ??
    process.env.SUPABASE_ANON_KEY ??
    ""
  ).trim();

  return { url, anonKey };
}

export function isValidSupabaseUrl(url: string) {
  if (!url || url === "undefined" || url === "null") return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname.length > 0
    );
  } catch {
    return false;
  }
}

const config = readConfig();

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = readConfig();

  if (!isValidSupabaseUrl(url) || !anonKey) {
    return null;
  }

  if (!client) {
    try {
      client = createClient(url, anonKey);
    } catch (error) {
      console.warn("[getSupabase]", error);
      return null;
    }
  }
  return client;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = readConfig();
  return isValidSupabaseUrl(url) && Boolean(anonKey);
}

export function getSupabaseConfigDebug() {
  const { url, anonKey } = readConfig();
  return {
    hasUrl: Boolean(url),
    urlValid: isValidSupabaseUrl(url),
    hasKey: Boolean(anonKey),
    urlPreview: url ? `${url.slice(0, 30)}…` : "(vacío)",
  };
}

export const EPISODE_PHOTOS_BUCKET = "episode-photos";
