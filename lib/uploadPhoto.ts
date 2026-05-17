import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { EPISODE_PHOTOS_BUCKET, getSupabase } from "./supabase";

const UPLOAD_TIMEOUT_MS = 20_000;

function isLocalUri(uri: string) {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("blob:") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://")
  );
}

function guessExtension(uri: string) {
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

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    return response.arrayBuffer();
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decode(base64);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)
    ),
  ]);
}

/**
 * Sube foto a Supabase Storage. Si falla, devuelve la URI local para no bloquear guardar.
 */
export async function uploadEpisodePhoto(localUri: string): Promise<string> {
  if (!isLocalUri(localUri)) {
    return localUri;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return localUri;
  }

  try {
    return await withTimeout(uploadToSupabase(localUri, supabase), UPLOAD_TIMEOUT_MS);
  } catch (error) {
    console.warn(
      "[uploadEpisodePhoto]",
      error instanceof Error ? error.message : error
    );
    return localUri;
  }
}

async function uploadToSupabase(
  localUri: string,
  supabase: NonNullable<ReturnType<typeof getSupabase>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ext = guessExtension(localUri);
  const fileName = `ep-${Date.now()}.${ext}`;
  const folder = user?.id ?? "uploads";
  const path = `${folder}/${fileName}`;

  const arrayBuffer = await readUriAsArrayBuffer(localUri);
  const contentType = mimeForExt(ext);

  const { error } = await supabase.storage
    .from(EPISODE_PHOTOS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EPISODE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
