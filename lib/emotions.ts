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
  { id: "gratitude", label: "Gratitud", emoji: "🙏", color: "#2dd4bf" },
  { id: "pride", label: "Orgullo", emoji: "💪", color: "#eab308" },
  { id: "fear", label: "Miedo", emoji: "😰", color: "#a855f7" },
  { id: "loneliness", label: "Soledad", emoji: "🌙", color: "#64748b" },
  { id: "surprise", label: "Sorpresa", emoji: "😮", color: "#38bdf8" },
  { id: "tiredness", label: "Cansancio", emoji: "😴", color: "#78716c" },
];

export function getEmotion(id: Emotion | string) {
  return EMOTIONS.find((e) => e.id === id) ?? EMOTIONS[0];
}
