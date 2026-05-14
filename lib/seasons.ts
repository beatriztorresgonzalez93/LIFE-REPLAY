import type { Episode, Season } from "./types";
import { getEmotion } from "./emotions";

export function groupEpisodesIntoSeasons(episodes: Episode[]): Season[] {
  const byYear = episodes.reduce<Record<number, Episode[]>>((acc, ep) => {
    if (!acc[ep.seasonYear]) acc[ep.seasonYear] = [];
    acc[ep.seasonYear].push(ep);
    return acc;
  }, {});

  return Object.entries(byYear)
    .map(([year, eps]) => {
      const sorted = [...eps].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const emotionCounts = sorted.reduce<Record<string, number>>((acc, ep) => {
        acc[ep.emotion] = (acc[ep.emotion] ?? 0) + 1;
        return acc;
      }, {});
      const dominantEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([e]) => e as Episode["emotion"]);

      return {
        year: Number(year),
        title: `Temporada ${year}`,
        synopsis: buildDefaultSynopsis(sorted, dominantEmotions),
        coverUrl: sorted[sorted.length - 1]?.photoUrl ?? "",
        episodes: sorted,
        dominantEmotions,
      };
    })
    .sort((a, b) => b.year - a.year);
}

function buildDefaultSynopsis(
  episodes: Episode[],
  emotions: Episode["emotion"][]
) {
  if (episodes.length === 0) return "Una temporada por escribir.";
  const labels = emotions.map((e) => getEmotion(e).label.toLowerCase());
  return `${episodes.length} episodios marcados por ${labels.join(", ")}.`;
}

export function getSeasonByYear(seasons: Season[], year: number) {
  return seasons.find((s) => s.year === year);
}
