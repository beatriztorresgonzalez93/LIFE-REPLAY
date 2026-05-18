import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { ensureSupabaseSession } from "./auth";
import { EPISODE_PHOTOS_BUCKET, getSupabase, isSupabaseConfigured } from "./supabase";

const UPLOAD_TIMEOUT_MS = 20_000;

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80";

function isLocalUri(uri: string) {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("blob:") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://")
  );
}

function isEphemeralUri(uri: string) {
  return uri.startsWith("blob:") || uri.startsWith("file://") || uri.startsWith("content://");
}

function guessExtension(uri: string, mimeType?: string) {
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("webp")) return "webp";
  const match = uri.match(/\.(jpe?g|png|webp|heic|heif)(\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

function mimeForExt(ext: string) {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext] ?? "image/jpeg";
}

async function readUriAsArrayBuffer(uri: string): Promise<{ buffer: ArrayBuffer; mimeType?: string }> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return { buffer: await blob.arrayBuffer(), mimeType: blob.type };
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { buffer: decode(base64) };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado al subir la foto")), ms)
    ),
  ]);
}

/**
 * Sube foto a Supabase Storage. Devuelve URL pública https.
 */
export async function uploadEpisodePhoto(localUri: string): Promise<string> {
  if (!isLocalUri(localUri)) {
    return localUri;
  }

  if (!isSupabaseConfigured()) {
    if (Platform.OS === "web") {
      throw new Error(
        "Supabase no está configurado en este build. Añade EXPO_PUBLIC_SUPABASE_URL en Vercel y haz Redeploy."
      );
    }
    return localUri;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return DEFAULT_PHOTO;
  }

  try {
    const publicUrl = await withTimeout(uploadToSupabase(localUri, supabase), UPLOAD_TIMEOUT_MS);
    if (isEphemeralUri(publicUrl)) {
      throw new Error("La foto no se subió correctamente a Storage.");
    }
    return publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al subir la foto";
    console.warn("[uploadEpisodePhoto]", message);
    throw new Error(
      `${message}. Comprueba Storage (episode-photos) y que Anonymous Auth esté activo en Supabase.`
    );
  }
}

async function uploadToSupabase(
  localUri: string,
  supabase: NonNullable<ReturnType<typeof getSupabase>>
) {
  await ensureSupabaseSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesión. Activa Anonymous Auth en Supabase.");
  }

  const { buffer, mimeType } = await readUriAsArrayBuffer(localUri);
  const ext = guessExtension(localUri, mimeType);
  const fileName = `ep-${Date.now()}.${ext}`;
  const path = `${user.id}/${fileName}`;
  const contentType =
    mimeType && mimeType !== "application/octet-stream" ? mimeType : mimeForExt(ext);

  const { error } = await supabase.storage
    .from(EPISODE_PHOTOS_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EPISODE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
