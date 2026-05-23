import { Pressable, StyleSheet, Text, View } from "react-native";
import { EpisodeImage } from "@/components/EpisodeImage";
import { Kicker } from "@/components/ui/Kicker";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getEmotion } from "@/lib/emotions";
import { useResponsive } from "@/lib/responsive";
import type { Season } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

export function SeasonCard({ season }: { season: Season }) {
  const { isDesktop, seasonCoverMaxHeight } = useResponsive();

  return (
    <Link href={`/season/${season.year}`} asChild>
      <Pressable style={styles.card}>
        <View
          style={[
            styles.coverWrap,
            isDesktop && styles.coverWrapDesktop,
            seasonCoverMaxHeight ? { maxHeight: seasonCoverMaxHeight } : null,
          ]}
        >
          <EpisodeImage uri={season.coverUrl} style={styles.cover} />
          <View style={styles.overlay} />
          <View style={styles.coverText}>
            <Kicker variant="overlay">TEMPORADA</Kicker>
            <Text style={styles.year}>{season.year}</Text>
            <Text style={styles.synopsis} numberOfLines={2}>
              {season.synopsis}
            </Text>
          </View>
          <View style={styles.play}>
            <FontAwesome name="play" size={12} color="#fff" />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.meta}>{season.episodes.length} episodios</Text>
          <View style={styles.badges}>
            {season.dominantEmotions.slice(0, 2).map((e) => {
              const emotion = getEmotion(e);
              return (
                <Text key={e} style={[styles.badge, { color: emotion.color }]}>
                  {emotion.emoji} {emotion.label}
                </Text>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flex: 1,
  },
  coverWrap: {
    aspectRatio: 2 / 3,
    position: "relative",
    overflow: "hidden",
  },
  coverWrapDesktop: {
    aspectRatio: 4 / 5,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  coverText: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  year: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  synopsis: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  play: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "500",
  },
});
