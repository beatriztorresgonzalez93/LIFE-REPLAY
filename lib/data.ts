import type { Episode, NewEpisodeInput } from "./types";
import { ensureSupabaseSession } from "./auth";
import {
  fetchEpisodesFromDatabase,
  saveNewEpisodeToDatabase,
  updateSeasonInDatabase,
  deleteEpisodeFromDatabase,
  isDatabaseEpisodeId,
} from "./supabaseEpisodes";
import { isSupabaseConfigured } from "./supabase";
import { parseLocalDate, todayIsoDate } from "./dates";
import { autoSeedDemoIfEmpty, SEED_EPISODES } from "./seedEpisodes";
import { getItem, setItem } from "./storage";

export { SEED_EPISODES };

const STORAGE_KEY = "life-replay-episodes";

export async function loadEpisodes(): Promise<Episode[]> {
  if (isSupabaseConfigured()) {
    try {
      await ensureSupabaseSession();
      let remote = await fetchEpisodesFromDatabase();
      if (remote.length === 0) {
        const seeded = await autoSeedDemoIfEmpty();
        if (seeded?.length) remote = seeded;
      }
      await setItem(STORAGE_KEY, JSON.stringify(remote));
      return remote;
    } catch (error) {
      console.warn("[loadEpisodes] Supabase:", error);
    }
  }

  return loadEpisodesLocal(true);
}

async function loadEpisodesLocal(useSeedIfEmpty = true): Promise<Episode[]> {
  try {
    const raw = await getItem(STORAGE_KEY);
    if (!raw) {
      if (useSeedIfEmpty) {
        const seeded = await autoSeedDemoIfEmpty();
        if (seeded?.length) return seeded;
        await setItem(STORAGE_KEY, JSON.stringify(SEED_EPISODES));
        return SEED_EPISODES;
      }
      return [];
    }
    const parsed = JSON.parse(raw) as Episode[];
    if (parsed.length === 0 && useSeedIfEmpty) {
      const seeded = await autoSeedDemoIfEmpty();
      if (seeded?.length) return seeded;
      await setItem(STORAGE_KEY, JSON.stringify(SEED_EPISODES));
      return SEED_EPISODES;
    }
    return parsed;
  } catch {
    return useSeedIfEmpty ? SEED_EPISODES : [];
  }
}

export async function saveEpisodes(episodes: Episode[]) {
  await setItem(STORAGE_KEY, JSON.stringify(episodes));
}

/** Guarda un episodio nuevo en Supabase (si está configurado) y en caché local. */
export async function saveNewEpisode(
  input: NewEpisodeInput,
  existing: Episode[]
): Promise<{ episode: Episode; savedToCloud: boolean }> {
  let episode = createEpisode(input, existing);
  let savedToCloud = false;

  if (isSupabaseConfigured()) {
    try {
      episode = await saveNewEpisodeToDatabase(input, existing, createEpisode);
      savedToCloud = true;
    } catch (error) {
      console.warn("[saveNewEpisode] Supabase:", error);
    }
  }

  const next = [episode, ...existing.filter((e) => e.id !== episode.id)];
  await saveEpisodes(next);
  return { episode, savedToCloud };
}

export async function saveSeasonAI(
  year: number,
  updates: { title: string; synopsis: string; conclusion: string; source?: string }
) {
  const { title, synopsis, conclusion } = updates;
  if (isSupabaseConfigured()) {
    try {
      await updateSeasonInDatabase(year, { title, synopsis, conclusion });
    } catch (error) {
      console.warn("[saveSeasonAI] Supabase:", error);
    }
  }
}

/** Elimina un episodio de la caché local y, si puede, de Supabase. */
export async function deleteEpisode(
  episodeId: string,
  existing: Episode[]
): Promise<{ episodes: Episode[]; deletedFromCloud: boolean }> {
  const next = existing.filter((e) => e.id !== episodeId);
  if (next.length === existing.length) {
    throw new Error("Episodio no encontrado en la lista.");
  }

  await saveEpisodes(next);

  let deletedFromCloud = !isDatabaseEpisodeId(episodeId);

  if (isSupabaseConfigured() && isDatabaseEpisodeId(episodeId)) {
    try {
      await deleteEpisodeFromDatabase(episodeId);
      deletedFromCloud = true;
    } catch (error) {
      deletedFromCloud = false;
      console.warn("[deleteEpisode] Supabase:", error);
    }
  }

  return { episodes: next, deletedFromCloud };
}

export function createEpisode(input: NewEpisodeInput, existing: Episode[]): Episode {
  const date =
    input.date?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(input.date.trim())
      ? input.date.trim()
      : todayIsoDate();

  const parsed = parseLocalDate(date);
  const year = parsed?.getFullYear() ?? new Date().getFullYear();
  const yearEpisodes = existing.filter((e) => e.seasonYear === year);
  const episodeNumber = yearEpisodes.length + 1;
  const id = `ep-${Date.now()}`;

  return {
    id,
    date,
    title: `Episodio ${episodeNumber}: ${generateEpisodeTitle(input.thought)}`,
    thought: input.thought,
    songTitle: input.songTitle,
    songArtist: input.songArtist,
    songUrl: input.songUrl,
    emotion: input.emotion,
    photoUrl: input.photoUrl,
    seasonYear: year,
    episodeNumber,
  };
}

function generateEpisodeTitle(thought: string) {
  const words = thought.trim().split(/\s+/).slice(0, 5).join(" ");
  return words.length > 30 ? `${words.slice(0, 30)}…` : words || "sin título";
}

export function getEpisodeById(episodes: Episode[], id: string) {
  return episodes.find((e) => e.id === id);
}

export {
  formatEpisodeDate,
  formatIsoToDisplayDate,
  isValidDisplayDate,
  parseDisplayDateToIso,
  todayDisplayDate,
  todayIsoDate,
} from "./dates";
