/** Foto por defecto si falta URL o falla la carga (Picsum, fiable en web y móvil). */
export const DEFAULT_EPISODE_PHOTO =
  "https://picsum.photos/seed/life-replay-default/800/600";

/** URL estable para episodios demo (una imagen distinta por episodio). */
export function demoEpisodePhotoUrl(seasonYear: number, index: number) {
  return `https://picsum.photos/seed/life-replay-${seasonYear}-${index}/800/600`;
}

export function resolveEpisodePhotoUrl(url?: string | null) {
  const trimmed = url?.trim();
  if (!trimmed) return DEFAULT_EPISODE_PHOTO;
  return trimmed;
}
