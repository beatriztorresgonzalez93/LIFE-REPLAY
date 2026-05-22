import { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EpisodeImage } from "@/components/EpisodeImage";
import { resolveEpisodePhotoUrl } from "@/lib/episodePhoto";
import type { Season } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

const POSTER_WIDTH = 900;

type Props = {
  season: Season;
};

/** Tarjeta fija para exportar como PNG (foto + textos de la temporada). */
export const SeasonRecapPoster = forwardRef<View, Props>(function SeasonRecapPoster(
  { season },
  ref
) {
  const thumbs = pickHighlightPhotos(season);
  const conclusion =
    season.conclusion?.trim() ||
    "Tu temporada sigue escribiéndose. Genera la conclusión con IA para cerrar el capítulo.";

  return (
    <View ref={ref} style={styles.poster} collapsable={false}>
      <View style={styles.coverWrap}>
        <EpisodeImage uri={season.coverUrl} style={styles.cover} />
        <View style={styles.coverOverlay} />
        <View style={styles.coverText}>
          <Text style={styles.brand}>LIFE REPLAY</Text>
          <Text style={styles.year}>TEMPORADA {season.year}</Text>
          <Text style={styles.coverTitle}>{season.title}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.synopsis}>{season.synopsis}</Text>
        <Text style={styles.conclusion}>{conclusion}</Text>
        <Text style={styles.meta}>
          {season.episodes.length} episodio
          {season.episodes.length === 1 ? "" : "s"}
        </Text>

        {thumbs.length > 0 ? (
          <View style={styles.thumbRow}>
            {thumbs.map((uri, i) => (
              <EpisodeImage key={`${uri}-${i}`} uri={uri} style={styles.thumb} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
});

function pickHighlightPhotos(season: Season) {
  const eps = [...season.episodes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (eps.length === 0) return [];
  if (eps.length <= 4) {
    return eps.map((e) => resolveEpisodePhotoUrl(e.photoUrl));
  }
  const picks = [
    eps[0],
    eps[Math.floor(eps.length / 3)],
    eps[Math.floor((2 * eps.length) / 3)],
    eps[eps.length - 1],
  ];
  return picks.map((e) => resolveEpisodePhotoUrl(e.photoUrl));
}

const styles = StyleSheet.create({
  poster: {
    width: POSTER_WIDTH,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  coverWrap: {
    height: 420,
    position: "relative",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  coverText: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  brand: {
    color: colors.accent,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: "800",
  },
  year: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: "600",
  },
  coverTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 8,
    lineHeight: 38,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  synopsis: {
    color: colors.foreground,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500",
  },
  conclusion: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  meta: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  thumbRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  thumb: {
    flex: 1,
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
});
