import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { EpisodeCard } from "@/components/EpisodeCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Button } from "@/components/ui/Button";
import { generateSeasonSummary } from "@/lib/ai";
import { loadEpisodes } from "@/lib/data";
import { useResponsive } from "@/lib/responsive";
import { getSeasonByYear, groupEpisodesIntoSeasons } from "@/lib/seasons";
import type { Season } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

export default function SeasonScreen() {
  const { year: yearParam } = useLocalSearchParams<{ year: string }>();
  const year = Number(yearParam);
  const { heroHeight, isDesktop } = useResponsive();
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadEpisodes().then((eps) => {
      const seasons = groupEpisodesIntoSeasons(eps);
      setSeason(getSeasonByYear(seasons, year) ?? null);
      setLoading(false);
    });
  }, [year]);

  async function handleGenerateAI() {
    if (!season) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const result = generateSeasonSummary(season);
    setSeason({
      ...season,
      title: result.title,
      synopsis: result.synopsis,
      conclusion: result.conclusion,
    });
    setGenerating(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!season) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Temporada no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View
        style={[
          styles.hero,
          { height: heroHeight + 40 },
          isDesktop && styles.heroDesktop,
        ]}
      >
        <Image source={{ uri: season.coverUrl }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <Text style={styles.kicker}>TEMPORADA</Text>
          <Text style={styles.title}>{season.title}</Text>
          <Text style={styles.synopsis}>{season.synopsis}</Text>
          <Text style={styles.meta}>
            {season.episodes.length} episodios · {year}
          </Text>
        </View>
      </View>

      <View style={styles.aiBox}>
        <View style={styles.aiHeader}>
          <View style={styles.aiTitleRow}>
            <FontAwesome name="magic" size={16} color={colors.accent} />
            <Text style={styles.aiTitle}>CONCLUSIÓN DE TEMPORADA</Text>
          </View>
          <Text style={styles.aiHint}>
            La IA analiza hasta 10 episodios y escribe el cierre cinematográfico.
          </Text>
        </View>
        <Button
          title={generating ? "Escribiendo..." : "Generar con IA"}
          onPress={handleGenerateAI}
          loading={generating}
        />
        <Text style={season.conclusion ? styles.conclusion : styles.placeholder}>
          {season.conclusion ??
            "Aún no hay conclusión. Pulsa el botón para que la IA cierre esta temporada."}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>EPISODIOS</Text>
      <View style={styles.list}>
        {[...season.episodes].reverse().map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} compact />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  muted: {
    color: colors.muted,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.lg,
    width: "100%",
  },
  heroDesktop: {
    maxHeight: 340,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroText: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 32,
    maxWidth: 640,
  },
  synopsis: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 560,
  },
  meta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 8,
  },
  aiBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  aiHeader: {
    gap: 6,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  aiHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  conclusion: {
    color: colors.foreground,
    fontSize: 15,
    lineHeight: 24,
  },
  placeholder: {
    color: colors.muted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  list: {
    gap: spacing.sm,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
});
