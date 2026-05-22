import type { Emotion, Episode, NewEpisodeInput } from "./types";
import { ensureSupabaseSession } from "./auth";
import { isSupabaseConfigured } from "./supabase";
import {
  fetchEpisodesFromDatabase,
  insertEpisodeToDatabase,
} from "./supabaseEpisodes";
import { demoEpisodePhotoUrl } from "./episodePhoto";
import { getItem, setItem } from "./storage";

const STORAGE_KEY = "life-replay-episodes";

type DemoEpisode = Omit<NewEpisodeInput, "photoUrl"> & {
  date: string;
  seasonYear: number;
};

/** Episodios de prueba en 2024, 2025 y 2026 (varias emociones y temas para Groq). */
export const DEMO_EPISODES: DemoEpisode[] = [
  // —— Temporada 2024 ——
  {
    seasonYear: 2024,
    date: "2024-03-10",
    thought:
      "Volví al piso de la infancia un fin de semana. El olor a lavanda en el pasillo me golpeó antes que cualquier abrazo.",
    songTitle: "Fourth of July",
    songArtist: "Sufjan Stevens",
    emotion: "nostalgia",
  },
  {
    seasonYear: 2024,
    date: "2024-06-21",
    thought:
      "El primer día sin miedo en la nueva ciudad. Caminé sin mapa hasta encontrar un río que no sabía que necesitaba.",
    songTitle: "Ribs",
    songArtist: "Lorde",
    emotion: "hope",
  },
  {
    seasonYear: 2024,
    date: "2024-09-02",
    thought:
      "Discutimos por trabajo otra vez. Cerré el portátil y entendí que el cansancio no era solo del proyecto.",
    songTitle: "Skinny Love",
    songArtist: "Bon Iver",
    emotion: "anger",
  },
  {
    seasonYear: 2024,
    date: "2024-12-24",
    thought:
      "Nochebuena en silencio a propósito. La familia al otro lado del teléfono sonó más cerca que en años.",
    songTitle: "White Winter Hymnal",
    songArtist: "Fleet Foxes",
    emotion: "love",
  },
  // —— Temporada 2025 ——
  {
    seasonYear: 2025,
    date: "2025-02-14",
    thought:
      "San Valentín sin drama: pizza, una película mala y la certeza de que el amor también es rutina bonita.",
    songTitle: "Pink + White",
    songArtist: "Frank Ocean",
    emotion: "love",
  },
  {
    seasonYear: 2025,
    date: "2025-05-18",
    thought:
      "Me ofrecieron el cambio de rol. Dije que sí antes de pensarlo y luego no dormí hasta entender por qué.",
    songTitle: "The Less I Know The Better",
    songArtist: "Tame Impala",
    emotion: "anxiety",
  },
  {
    seasonYear: 2025,
    date: "2025-08-03",
    thought:
      "Playa con amigas después de meses de soledad elegida. Me reí tan fuerte que me dolió la mandíbula.",
    songTitle: "Levitating",
    songArtist: "Dua Lipa",
    emotion: "joy",
  },
  {
    seasonYear: 2025,
    date: "2025-11-08",
    thought:
      "La ciudad brillaba como si supiera que yo necesitaba un recordatorio de que el invierno no lo es todo.",
    songTitle: "Apocalypse",
    songArtist: "Cigarettes After Sex",
    emotion: "nostalgia",
  },
  {
    seasonYear: 2025,
    date: "2025-12-31",
    thought:
      "Brindé con gente que quiero y pensé en todo lo que sobreviví sin darme cuenta.",
    songTitle: "Supercut",
    songArtist: "Lorde",
    emotion: "joy",
  },
  // —— Temporada 2026 ——
  {
    seasonYear: 2026,
    date: "2026-01-14",
    thought:
      "Hoy empecé algo nuevo. No sé adónde llevará, pero por primera vez en semanas siento que estoy escribiendo mi propia historia.",
    songTitle: "Motion Sickness",
    songArtist: "Phoebe Bridgers",
    songUrl: "https://open.spotify.com",
    emotion: "hope",
  },
  {
    seasonYear: 2026,
    date: "2026-02-03",
    thought:
      "Me senté sola en la cafetería de la esquina. Nadie me escribió y, extrañamente, eso estuvo bien.",
    songTitle: "Kyoto",
    songArtist: "Phoebe Bridgers",
    emotion: "calm",
  },
  {
    seasonYear: 2026,
    date: "2026-03-22",
    thought:
      "Abrí el correo tres veces antes de responder. Quería mandarlo todo a la mierda. Al final no lo hice, pero el impulso fue real.",
    songTitle: "Bags",
    songArtist: "Clairo",
    emotion: "anxiety",
  },
  {
    seasonYear: 2026,
    date: "2026-04-15",
    thought:
      "Miedo a fallar en la presentación, pero salió bien. El trabajo ya no me define tanto como antes.",
    songTitle: "Green Light",
    songArtist: "Lorde",
    emotion: "hope",
  },
  {
    seasonYear: 2026,
    date: "2026-05-10",
    thought:
      "Atardecer desde el balcón. Calma después del caos. Mañana vuelve el ruido, pero hoy guardo este fotograma.",
    songTitle: "Sunset Lover",
    songArtist: "Petit Biscuit",
    emotion: "calm",
  },
];

function demoToSeedEpisode(demo: DemoEpisode, index: number): Episode {
  const inSeason = DEMO_EPISODES.filter((d) => d.seasonYear === demo.seasonYear);
  const episodeNumber =
    inSeason
      .sort((a, b) => a.date.localeCompare(b.date))
      .findIndex((d) => d.date === demo.date && d.thought === demo.thought) + 1;

  const short =
    demo.thought.trim().split(/\s+/).slice(0, 5).join(" ").slice(0, 30) + "…";

  return {
    id: `seed-${index}`,
    date: demo.date,
    title: `Episodio ${episodeNumber}: ${short}`,
    thought: demo.thought,
    songTitle: demo.songTitle,
    songArtist: demo.songArtist,
    songUrl: demo.songUrl,
    emotion: demo.emotion,
    photoUrl: demoEpisodePhotoUrl(demo.seasonYear, index),
    seasonYear: demo.seasonYear,
    episodeNumber,
  };
}

/** Para AsyncStorage cuando no hay Supabase. */
export const SEED_EPISODES: Episode[] = DEMO_EPISODES.map((d, i) =>
  demoToSeedEpisode(d, i)
);

let autoSeedInFlight = false;

/** Si la cuenta no tiene episodios, inserta la demo (Supabase o local). */
export async function autoSeedDemoIfEmpty(): Promise<Episode[] | null> {
  if (autoSeedInFlight) return null;
  autoSeedInFlight = true;
  try {
    if (isSupabaseConfigured()) {
      try {
        await ensureSupabaseSession();
      } catch {
        return null;
      }
      const existing = await fetchEpisodesFromDatabase();
      if (existing.length > 0) return null;
      await seedDemoEpisodesToCloud();
      return fetchEpisodesFromDatabase();
    }

    const raw = await getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Episode[];
      if (parsed.length > 0) return null;
    }
    await seedDemoEpisodesLocal();
    return SEED_EPISODES;
  } finally {
    autoSeedInFlight = false;
  }
}

/** Inserta episodios demo en Supabase (cuenta actual). Orden cronológico. */
export async function seedDemoEpisodesToCloud(options?: {
  allowIfNotEmpty?: boolean;
}): Promise<number> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  await ensureSupabaseSession();
  const existing = await fetchEpisodesFromDatabase();
  if (existing.length > 0 && !options?.allowIfNotEmpty) {
    throw new Error(
      `Ya tienes ${existing.length} episodio(s). Pulsa de nuevo el botón y confirma para añadir la demo igualmente.`
    );
  }

  const sorted = [...DEMO_EPISODES].sort(
    (a, b) =>
      a.seasonYear - b.seasonYear || a.date.localeCompare(b.date)
  );

  const created: Episode[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const demo = sorted[i];
    const draft = demoToSeedEpisode(demo, i);
    const ep = await insertEpisodeToDatabase(draft);
    created.push(ep);
  }

  const all = options?.allowIfNotEmpty ? [...existing, ...created] : created;
  await setItem(STORAGE_KEY, JSON.stringify(all));
  return created.length;
}

/** Carga demo en AsyncStorage (sin Supabase). */
export async function seedDemoEpisodesLocal(options?: {
  allowIfNotEmpty?: boolean;
}): Promise<number> {
  const raw = await getItem(STORAGE_KEY);
  let existing: Episode[] = [];
  if (raw) {
    existing = JSON.parse(raw) as Episode[];
    if (existing.length > 0 && !options?.allowIfNotEmpty) {
      throw new Error(
        `Ya hay ${existing.length} episodio(s) en el dispositivo. Confirma en el botón para añadir la demo.`
      );
    }
  }

  if (options?.allowIfNotEmpty && existing.length > 0) {
    const merged = [...existing];
    for (let i = 0; i < SEED_EPISODES.length; i++) {
      const draft = SEED_EPISODES[i];
      merged.push({ ...draft, id: `seed-${Date.now()}-${i}` });
    }
    await setItem(STORAGE_KEY, JSON.stringify(merged));
    return SEED_EPISODES.length;
  }

  await setItem(STORAGE_KEY, JSON.stringify(SEED_EPISODES));
  return SEED_EPISODES.length;
}
