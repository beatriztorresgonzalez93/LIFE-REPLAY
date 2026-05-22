import { Pressable, StyleSheet, Text, View } from "react-native";
import { EpisodeImage } from "@/components/EpisodeImage";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { formatEpisodeDate } from "@/lib/data";
import { getEmotion } from "@/lib/emotions";
import { useResponsive } from "@/lib/responsive";
import type { Episode } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

export function EpisodeCard({
  episode,
  compact,
}: {
  episode: Episode;
  compact?: boolean;
}) {
  const { thumb } = useResponsive();
  const emotion = getEmotion(episode.emotion);

  return (
    <Link href={`/episode/${episode.id}`} asChild>
      <Pressable style={styles.card}>
        <EpisodeImage
          uri={episode.photoUrl}
          style={[styles.thumb, { width: thumb.width, height: thumb.height }]}
        />
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
    borderRadius: radius.sm,
  },
  body: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  date: {
    color: colors.muted,
    fontSize: 12,
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
