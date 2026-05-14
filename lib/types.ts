export type Emotion =
  | "joy"
  | "sadness"
  | "anxiety"
  | "love"
  | "anger"
  | "calm"
  | "hope"
  | "nostalgia";

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

export interface NewEpisodeInput {
  thought: string;
  songTitle: string;
  songArtist: string;
  songUrl?: string;
  emotion: Emotion;
  photoUrl: string;
}
