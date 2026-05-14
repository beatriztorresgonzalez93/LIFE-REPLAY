import type { Emotion } from "./types";

export const EMOTIONS: {
  id: Emotion;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { id: "joy", label: "Alegría", emoji: "✨", color: "#fbbf24" },
  { id: "sadness", label: "Tristeza", emoji: "🌧️", color: "#60a5fa" },
  { id: "anxiety", label: "Ansiedad", emoji: "⚡", color: "#f97316" },
  { id: "love", label: "Amor", emoji: "❤️", color: "#f43f5e" },
  { id: "anger", label: "Enfado", emoji: "🔥", color: "#ef4444" },
  { id: "calm", label: "Calma", emoji: "🌿", color: "#34d399" },
  { id: "hope", label: "Esperanza", emoji: "🌅", color: "#a78bfa" },
  { id: "nostalgia", label: "Nostalgia", emoji: "📼", color: "#c084fc" },
];

export function getEmotion(id: Emotion) {
  return EMOTIONS.find((e) => e.id === id) ?? EMOTIONS[0];
}
