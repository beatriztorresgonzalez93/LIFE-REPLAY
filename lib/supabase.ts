import Constants from "expo-constants";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  EMBEDDED_SUPABASE_ANON_KEY,
  EMBEDDED_SUPABASE_URL,
} from "./env.generated";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function readConfig() {
  const url = firstNonEmpty(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    extra?.supabaseUrl,
    EMBEDDED_SUPABASE_URL,
    process.env.SUPABASE_URL
  );

  const anonKey = firstNonEmpty(
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    extra?.supabaseAnonKey,
    EMBEDDED_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  );

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
    hasEmbeddedUrl: Boolean(EMBEDDED_SUPABASE_URL),
    hasEmbeddedKey: Boolean(EMBEDDED_SUPABASE_ANON_KEY),
    urlPreview: url ? `${url.slice(0, 40)}…` : "(vacío)",
  };
}

export const EPISODE_PHOTOS_BUCKET = "episode-photos";
