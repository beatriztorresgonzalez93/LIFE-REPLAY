import { ensureSupabaseSession, ensureUserProfile } from "./auth";
import { getSupabase } from "./supabase";
import type { Episode, Emotion, NewEpisodeInput } from "./types";

type DbSeason = {
  year: number;
  title: string;
  synopsis: string;
  conclusion: string | null;
};

type DbEpisodeRow = {
  id: string;
  date: string;
  title: string;
  thought: string;
  song_title: string;
  song_artist: string;
  song_url: string | null;
  emotion: Emotion;
  photo_url: string;
  episode_number: number;
  seasons: DbSeason | DbSeason[];
};

function normalizeSeason(seasons: DbSeason | DbSeason[]): DbSeason {
  return Array.isArray(seasons) ? seasons[0] : seasons;
}

function mapRow(row: DbEpisodeRow): Episode {
  const season = normalizeSeason(row.seasons);
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    thought: row.thought,
    songTitle: row.song_title,
    songArtist: row.song_artist,
    songUrl: row.song_url ?? undefined,
    emotion: row.emotion,
    photoUrl: row.photo_url,
    seasonYear: season.year,
    episodeNumber: row.episode_number,
  };
}

export async function fetchEpisodesFromDatabase(): Promise<Episode[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await ensureSupabaseSession();

  const { data, error } = await supabase
    .from("episodes")
    .select(
      `
      id, date, title, thought, song_title, song_artist, song_url,
      emotion, photo_url, episode_number,
      seasons!inner (year, title, synopsis, conclusion)
    `
    )
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as DbEpisodeRow[]).map(mapRow);
}

async function getOrCreateSeason(userId: string, year: number) {
  const supabase = getSupabase()!;

  const { data: existing } = await supabase
    .from("seasons")
    .select("id, year, title, synopsis")
    .eq("user_id", userId)
    .eq("year", year)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("seasons")
    .insert({
      user_id: userId,
      year,
      title: `Temporada ${year}`,
      synopsis: "",
    })
    .select("id, year, title, synopsis")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function insertEpisodeToDatabase(
  draft: Episode
): Promise<Episode> {
  const supabase = getSupabase();
  if (!supabase) return draft;

  const session = await ensureSupabaseSession();
  const userId = session?.user.id;
  if (!userId) throw new Error("No hay usuario de sesión");

  await ensureUserProfile(userId);
  const season = await getOrCreateSeason(userId, draft.seasonYear);

  const { data: countRows } = await supabase
    .from("episodes")
    .select("episode_number")
    .eq("season_id", season.id);

  const episodeNumber =
    countRows && countRows.length > 0
      ? Math.max(...countRows.map((r) => r.episode_number)) + 1
      : 1;

  const title = `Episodio ${episodeNumber}: ${shortTitle(draft.thought)}`;

  const { data, error } = await supabase
    .from("episodes")
    .insert({
      user_id: userId,
      season_id: season.id,
      episode_number: episodeNumber,
      date: draft.date,
      title,
      thought: draft.thought,
      song_title: draft.songTitle,
      song_artist: draft.songArtist,
      song_url: draft.songUrl ?? null,
      emotion: draft.emotion,
      photo_url: draft.photoUrl,
    })
    .select(
      `
      id, date, title, thought, song_title, song_artist, song_url,
      emotion, photo_url, episode_number,
      seasons!inner (year, title, synopsis, conclusion)
    `
    )
    .single();

  if (error) throw new Error(error.message);

  return mapRow(data as unknown as DbEpisodeRow);
}

function shortTitle(thought: string) {
  const words = thought.trim().split(/\s+/).slice(0, 5).join(" ");
  return words.length > 30 ? `${words.slice(0, 30)}…` : words || "sin título";
}

export async function updateSeasonInDatabase(
  year: number,
  updates: { title?: string; synopsis?: string; conclusion?: string }
) {
  const supabase = getSupabase();
  if (!supabase) return;

  const session = await ensureSupabaseSession();
  const userId = session?.user.id;
  if (!userId) return;

  const { error } = await supabase
    .from("seasons")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("year", year);

  if (error) throw new Error(error.message);
}

export async function saveNewEpisodeToDatabase(
  input: NewEpisodeInput,
  existing: Episode[],
  buildDraft: (input: NewEpisodeInput, existing: Episode[]) => Episode
): Promise<Episode> {
  const draft = buildDraft(input, existing);
  return insertEpisodeToDatabase(draft);
}

export async function deleteEpisodeFromDatabase(episodeId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const session = await ensureSupabaseSession();
  const userId = session?.user.id;
  if (!userId) throw new Error("No hay sesión de usuario");

  const { data, error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", episodeId)
    .eq("user_id", userId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(
      "No se pudo borrar en la nube (episodio de otra sesión o ya eliminado)."
    );
  }
}

export function isDatabaseEpisodeId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
