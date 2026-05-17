import { EPISODE_PHOTOS_BUCKET, getSupabase } from "./supabase";

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

/**
 * Sube una foto local a Supabase Storage.
 * Ruta: {userId}/ep-{timestamp}.ext (con sesión) o uploads/ep-{timestamp}.ext (sin sesión, requiere política dev).
 */
export async function uploadEpisodePhoto(localUri: string): Promise<string> {
  if (!isLocalUri(localUri)) {
    return localUri;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return localUri;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ext = guessExtension(localUri);
  const fileName = `ep-${Date.now()}.${ext}`;
  const folder = user?.id ?? "uploads";
  const path = `${folder}/${fileName}`;

  const response = await fetch(localUri);
  const blob = await response.blob();
  const contentType = blob.type && blob.type !== "application/octet-stream"
    ? blob.type
    : mimeForExt(ext);

  const { error } = await supabase.storage
    .from(EPISODE_PHOTOS_BUCKET)
    .upload(path, blob, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.warn("[uploadEpisodePhoto]", error.message);
    return localUri;
  }

  const { data } = supabase.storage.from(EPISODE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
