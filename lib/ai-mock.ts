import type { Season, SeasonAIResult } from "./types";
import { getEmotion } from "./emotions";
import {
  getSeasonEpisodesChronological,
  buildSeasonStats,
} from "./seasonAiContext";

/** Generador local (sin API). Respaldo si no hay clave Groq o falla la red. */
export function generateSeasonSummaryMock(season: Season): SeasonAIResult {
  const episodes = getSeasonEpisodesChronological(season);
  const stats = buildSeasonStats(episodes);
  const emotions = season.dominantEmotions
    .map((e) => getEmotion(e).label.toLowerCase())
    .join(", ");

  const themes = extractThemes(episodes);
  const title = buildSeasonTitle(season.year, emotions, themes);
  const synopsis = buildSynopsis(stats.count, stats.spanLabel, emotions, themes);
  const conclusion = buildConclusion(episodes, emotions, themes);

  return { title, synopsis, conclusion, source: "mock" as const };
}

function extractThemes(episodes: { thought: string }[]) {
  const keywords = [
    "trabajo",
    "familia",
    "amor",
    "miedo",
    "cambio",
    "soledad",
    "gratitud",
    "orgullo",
    "cansancio",
  ];
  const text = episodes.map((e) => e.thought.toLowerCase()).join(" ");
  return keywords.filter((k) => text.includes(k));
}

function buildSeasonTitle(year: number, emotions: string, themes: string[]) {
  if (themes.includes("cambio")) return `Temporada ${year}: caos y crecimiento`;
  if (themes.includes("amor")) return `Temporada ${year}: latidos y distancia`;
  if (emotions.includes("ansiedad")) return `Temporada ${year}: noches largas`;
  return `Temporada ${year}: memorias en loop`;
}

function buildSynopsis(
  count: number,
  spanLabel: string,
  emotions: string,
  themes: string[]
) {
  const themeText =
    themes.length > 0 ? `Entre ${themes.slice(0, 2).join(" y ")}, ` : "";
  return `${themeText}${count} episodios de ${spanLabel}, tejidos con ${emotions}. Una temporada íntima que merece reverso.`;
}

function buildConclusion(
  episodes: { title: string }[],
  emotions: string,
  themes: string[]
) {
  const first = episodes[0];
  const last = episodes[episodes.length - 1];
  const arc = themes.includes("cambio")
    ? "Esta temporada no fue lineal: hubo retrocesos, pausas y una voluntad silenciosa de seguir."
    : "Los días se acumularon como escenas de una serie que solo tú estabas viendo en directo.";

  return `${arc} De "${first?.title ?? "el inicio"}" a "${last?.title ?? "el cierre"}", tus ${episodes.length} capítulos dibujaron un mapa emocional dominado por ${emotions}. No fue una temporada perfecta, pero fue tuya — y eso la hace irrepetible.`;
}
