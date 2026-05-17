import type { Episode, NewEpisodeInput } from "./types";
import { ensureSupabaseSession } from "./auth";
import {
  fetchEpisodesFromDatabase,
  saveNewEpisodeToDatabase,
  updateSeasonInDatabase,
} from "./supabaseEpisodes";
import { isSupabaseConfigured } from "./supabase";
import { getItem, setItem } from "./storage";

const STORAGE_KEY = "life-replay-episodes";

export const SEED_EPISODES: Episode[] = [
  {
    id: "ep-1",
    date: "2026-01-14",
    title: "Episodio 1: el primer paso",
    thought:
      "Hoy empecé algo nuevo. No sé adónde llevará, pero por primera vez en semanas siento que estoy escribiendo mi propia historia.",
    songTitle: "Motion Sickness",
    songArtist: "Phoebe Bridgers",
    songUrl: "https://open.spotify.com",
    emotion: "hope",
    photoUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
    seasonYear: 2026,
    episodeNumber: 1,
  },
  {
    id: "ep-2",
    date: "2026-02-03",
    title: "Episodio 2: café y silencio",
    thought:
      "Me senté sola en la cafetería de la esquina. Nadie me escribió y, extrañamente, eso estuvo bien.",
    songTitle: "Kyoto",
    songArtist: "Phoebe Bridgers",
    emotion: "calm",
    photoUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    seasonYear: 2026,
    episodeNumber: 2,
  },
  {
    id: "ep-3",
    date: "2026-03-22",
    title: "Episodio 3: el día que casi renuncias",
    thought:
      "Abrí el correo tres veces antes de responder. Quería mandarlo todo a la mierda. Al final no lo hice, pero el impulso fue real.",
    songTitle: "Bags",
    songArtist: "Clairo",
    emotion: "anxiety",
    photoUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    seasonYear: 2026,
    episodeNumber: 3,
  },
  {
    id: "ep-4",
    date: "2025-11-08",
    title: "Episodio 12: luces de noviembre",
    thought:
      "La ciudad brillaba como si supiera que yo necesitaba un recordatorio de que el invierno no lo es todo.",
    songTitle: "Apocalypse",
    songArtist: "Cigarettes After Sex",
    emotion: "nostalgia",
    photoUrl:
      "https://images.unsplash.com/photo-1477959857187-60b19dd07fcb?w=800&q=80",
    seasonYear: 2025,
    episodeNumber: 12,
  },
  {
    id: "ep-5",
    date: "2025-12-31",
    title: "Episodio 15: última escena del año",
    thought:
      "Brindé con gente que quiero y pensé en todo lo que sobreviví sin darme cuenta.",
    songTitle: "Supercut",
    songArtist: "Lorde",
    emotion: "joy",
    photoUrl:
      "https://images.unsplash.com/photo-1467810567424-72b939b314b8?w=800&q=80",
    seasonYear: 2025,
    episodeNumber: 15,
  },
];

export async function loadEpisodes(): Promise<Episode[]> {
  if (isSupabaseConfigured()) {
    try {
      await ensureSupabaseSession();
      const remote = await fetchEpisodesFromDatabase();
      if (remote.length > 0) {
        await setItem(STORAGE_KEY, JSON.stringify(remote));
        return remote;
      }
    } catch (error) {
      console.warn("[loadEpisodes] Supabase:", error);
    }
  }

  return loadEpisodesLocal();
}

async function loadEpisodesLocal(): Promise<Episode[]> {
  try {
    const raw = await getItem(STORAGE_KEY);
    if (!raw) {
      await setItem(STORAGE_KEY, JSON.stringify(SEED_EPISODES));
      return SEED_EPISODES;
    }
    return JSON.parse(raw) as Episode[];
  } catch {
    return SEED_EPISODES;
  }
}

export async function saveEpisodes(episodes: Episode[]) {
  await setItem(STORAGE_KEY, JSON.stringify(episodes));
}

/** Guarda un episodio nuevo en Supabase (si está configurado) y en caché local. */
export async function saveNewEpisode(
  input: NewEpisodeInput,
  existing: Episode[]
): Promise<Episode> {
  let episode = createEpisode(input, existing);

  if (isSupabaseConfigured()) {
    try {
      episode = await saveNewEpisodeToDatabase(input, existing, createEpisode);
    } catch (error) {
      console.warn("[saveNewEpisode] Supabase:", error);
      throw error;
    }
  }

  const next = [episode, ...existing.filter((e) => e.id !== episode.id)];
  await saveEpisodes(next);
  return episode;
}

export async function saveSeasonAI(
  year: number,
  updates: { title: string; synopsis: string; conclusion: string }
) {
  if (isSupabaseConfigured()) {
    try {
      await updateSeasonInDatabase(year, updates);
    } catch (error) {
      console.warn("[saveSeasonAI] Supabase:", error);
    }
  }
}

export function createEpisode(input: NewEpisodeInput, existing: Episode[]): Episode {
  const year = new Date().getFullYear();
  const yearEpisodes = existing.filter((e) => e.seasonYear === year);
  const episodeNumber = yearEpisodes.length + 1;
  const id = `ep-${Date.now()}`;

  return {
    id,
    date: new Date().toISOString().split("T")[0],
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

export function formatEpisodeDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
