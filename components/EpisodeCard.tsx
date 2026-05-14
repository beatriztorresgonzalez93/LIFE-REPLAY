import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { formatEpisodeDate } from "@/lib/data";
import { getEmotion } from "@/lib/emotions";
import type { Episode } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

export function EpisodeCard({
  episode,
  compact,
}: {
  episode: Episode;
  compact?: boolean;
}) {
  const emotion = getEmotion(episode.emotion);

  return (
    <Link href={`/episode/${episode.id}`} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: episode.photoUrl }} style={styles.thumb} />
        <View style={styles.body}>
          <Text style={styles.date}>{formatEpisodeDate(episode.date)}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {episode.title}
          </Text>
          {!compact && (
            <Text style={styles.thought} numberOfLines={2}>
              {episode.thought}
            </Text>
          )}
          <View style={styles.meta}>
            <Text style={[styles.emotion, { color: emotion.color }]}>
              {emotion.emoji} {emotion.label}
            </Text>
            <View style={styles.song}>
              <FontAwesome name="music" size={10} color={colors.muted} />
              <Text style={styles.songText} numberOfLines={1}>
                {episode.songTitle}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 72,
    height: 88,
    borderRadius: radius.sm,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  date: {
    color: colors.muted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
  thought: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    marginTop: 4,
    gap: 4,
  },
  emotion: {
    fontSize: 12,
    fontWeight: "500",
  },
  song: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  songText: {
    color: colors.muted,
    fontSize: 12,
    flex: 1,
  },
});
