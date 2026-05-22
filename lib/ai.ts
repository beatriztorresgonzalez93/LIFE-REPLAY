import { generateSeasonSummaryMock } from "./ai-mock";
import { getEmotion } from "./emotions";
import { groqChatCompletion, isGroqConfigured } from "./groq";
import {
  buildEpisodesContextBlock,
  buildSeasonStats,
  getSeasonEpisodesChronological,
} from "./seasonAiContext";
import type { Episode, Season, SeasonAIResult } from "./types";

export type { SeasonAIResult };

export type GenerateSeasonSummaryOptions = {
  /** Si true y no hay Groq, usa plantillas locales. */
  allowMockFallback?: boolean;
};

export async function generateSeasonSummary(
  season: Season,
  options?: GenerateSeasonSummaryOptions
): Promise<SeasonAIResult> {
  const episodes = getSeasonEpisodesChronological(season);
  if (episodes.length === 0) {
    throw new Error("Añade al menos un episodio a esta temporada antes de generar.");
  }

  if (isGroqConfigured()) {
    return generateSeasonSummaryWithGroq(season, episodes);
  }

  if (options?.allowMockFallback !== false) {
    console.info("[Life Replay] Sin clave Groq → conclusión con plantillas locales");
    return generateSeasonSummaryMock(season);
  }

  throw new Error(
    "Configura EXPO_PUBLIC_GROQ_API_KEY en .env para usar la IA (https://console.groq.com)."
  );
}

async function generateSeasonSummaryWithGroq(
  season: Season,
  episodes: Episode[]
): Promise<SeasonAIResult> {
  const emotions = season.dominantEmotions
    .map((e) => getEmotion(e).label)
    .join(", ");

  const stats = buildSeasonStats(episodes);
  const episodesBlock = buildEpisodesContextBlock(episodes);

  const raw = await groqChatCompletion(
    [
      {
        role: "system",
        content: `Eres un guionista de series íntimas en español (tono cinematográfico, cálido, sin clichés vacíos).
Analizas un diario personal por TEMPORADAS (un año = una temporada). Cada día puede ser un episodio.
Debes leer TODOS los episodios del listado (del primer al último día) y sintetizar el arco completo de ese año, no solo el final.
Responde ÚNICAMENTE con un JSON válido (sin markdown):
{"title":"string","synopsis":"string","conclusion":"string"}
- title: nombre evocador de la temporada (máx. 60 caracteres), puede incluir el año ${season.year}.
- synopsis: 2-3 frases en segunda persona (tú), resumen de toda la temporada.
- conclusion: 2-3 párrafos que cierren el arco de TODA la temporada (inicio, medio y desenlace emocional).`,
      },
      {
        role: "user",
        content: `Temporada ${season.year}
Episodios en esta temporada: ${stats.count} (del ${stats.spanLabel})
Emociones dominantes: ${emotions || "variadas"}

Listado cronológico completo:
${episodesBlock}`,
      },
    ],
    { maxTokens: 1400 }
  );

  const parsed = parseSeasonAIResult(raw);
  console.info(
    `[Life Replay] Conclusión Groq — ${episodes.length} episodio(s) de la temporada ${season.year}`
  );
  return { ...parsed, source: "groq" as const };
}

function parseSeasonAIResult(raw: string): Omit<SeasonAIResult, "source"> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("La IA no devolvió JSON válido. Inténtalo de nuevo.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Respuesta de IA incompleta.");
  }

  const obj = parsed as Record<string, unknown>;
  const title = String(obj.title ?? "").trim();
  const synopsis = String(obj.synopsis ?? "").trim();
  const conclusion = String(obj.conclusion ?? "").trim();

  if (!title || !synopsis || !conclusion) {
    throw new Error("La IA omitió título, sinopsis o conclusión.");
  }

  return { title, synopsis, conclusion };
}
