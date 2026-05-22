export type Emotion =
  | "joy"
  | "sadness"
  | "anxiety"
  | "love"
  | "anger"
  | "calm"
  | "hope"
  | "nostalgia"
  | "gratitude"
  | "pride"
  | "fear"
  | "loneliness"
  | "surprise"
  | "tiredness";

export interface Episode {
  id: string;
  date: string;
  title: string;
  thought: string;
  songTitle: string;
  songArtist: string;
  songUrl?: string;
  emotion: Emotion;
  photoUrl: string;
  seasonYear: number;
  episodeNumber: number;
}

export interface Season {
  year: number;
  title: string;
  synopsis: string;
  conclusion?: string;
  coverUrl: string;
  episodes: Episode[];
  dominantEmotions: Emotion[];
}

export type SeasonAISource = "groq" | "mock";

export interface SeasonAIResult {
  title: string;
  synopsis: string;
  conclusion: string;
  /** groq = API Groq; mock = plantillas locales */
  source: SeasonAISource;
}

export interface NewEpisodeInput {
  thought: string;
  songTitle: string;
  songArtist: string;
  songUrl?: string;
  emotion: Emotion;
  photoUrl: string;
  /** Temporada (año). Por defecto, año actual. */
  seasonYear?: number;
  /** Fecha ISO (YYYY-MM-DD). Por defecto, hoy. */
  date?: string;
}
