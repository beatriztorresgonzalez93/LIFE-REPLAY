import { formatEpisodeDate } from "./dates";
import { getEmotion } from "./emotions";
import type { Episode, Season } from "./types";

/** Todos los episodios de la temporada, del primero al último día. */
export function getSeasonEpisodesChronological(season: Season): Episode[] {
  return [...season.episodes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function truncateThought(text: string, maxLen: number) {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** Ajusta longitud del pensamiento según cuántos episodios hay (límite de tokens). */
function maxThoughtLength(episodeCount: number) {
  if (episodeCount <= 30) return 500;
  if (episodeCount <= 90) return 220;
  if (episodeCount <= 200) return 120;
  return 80;
}

export function buildSeasonStats(episodes: Episode[]) {
  if (episodes.length === 0) {
    return { count: 0, firstDate: "", lastDate: "", spanLabel: "" };
  }
  const first = episodes[0];
  const last = episodes[episodes.length - 1];
  return {
    count: episodes.length,
    firstDate: first.date,
    lastDate: last.date,
    spanLabel: `${formatEpisodeDate(first.date)} → ${formatEpisodeDate(last.date)}`,
  };
}

/** Texto compacto con TODA la temporada para enviar a Groq. */
export function buildEpisodesContextBlock(episodes: Episode[]) {
  const maxLen = maxThoughtLength(episodes.length);
  return episodes
    .map((ep) => {
      const emotion = getEmotion(ep.emotion).label;
      const dateLabel = formatEpisodeDate(ep.date);
      return [
        `· Ep. ${ep.episodeNumber} (${dateLabel}) — ${emotion}`,
        `  ${truncateThought(ep.thought, maxLen)}`,
        `  🎵 ${ep.songArtist} — ${ep.songTitle}`,
      ].join("\n");
    })
    .join("\n");
}
