import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { EpisodeCard } from "@/components/EpisodeCard";
import { EpisodeImage } from "@/components/EpisodeImage";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenLoading } from "@/components/ScreenLoading";
import { SeasonRecapPoster } from "@/components/SeasonRecapPoster";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";
import { Kicker } from "@/components/ui/Kicker";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useEpisodes } from "@/hooks/useEpisodes";
import { exportRecapPoster } from "@/lib/exportRecapImage";
import { generateSeasonSummary } from "@/lib/ai";
import { saveSeasonAI } from "@/lib/data";
import { useResponsive } from "@/lib/responsive";
import { getSeasonByYear } from "@/lib/seasons";
import type { Season } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

type SeasonOverrides = Partial<Pick<Season, "title" | "synopsis" | "conclusion">>;

export default function SeasonScreen() {
  const { year: yearParam } = useLocalSearchParams<{ year: string }>();
  const year = Number(yearParam);
  const { heroHeight, isDesktop } = useResponsive();
  const { seasons, ready } = useEpisodes();
  const [overrides, setOverrides] = useState<SeasonOverrides>({});
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const recapRef = useRef<View>(null);

  const baseSeason = useMemo(
    () => getSeasonByYear(seasons, year) ?? null,
    [seasons, year]
  );

  const season = useMemo(() => {
    if (!baseSeason) return null;
    return { ...baseSeason, ...overrides };
  }, [baseSeason, overrides]);

  useEffect(() => {
    setOverrides({});
  }, [year]);

  async function handleDownloadRecap() {
    if (!season) return;
    setExporting(true);
    try {
      await exportRecapPoster(recapRef, year);
    } catch (e) {
      Alert.alert(
        "No se pudo exportar",
        e instanceof Error ? e.message : "Inténtalo de nuevo en unos segundos."
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleGenerateAI() {
    if (!season) return;
    setAiError(null);
    setGenerating(true);
    try {
      const result = await generateSeasonSummary(season);
      setOverrides({
        title: result.title,
        synopsis: result.synopsis,
        conclusion: result.conclusion,
      });
      await saveSeasonAI(year, result);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "No se pudo generar con la IA.");
    } finally {
      setGenerating(false);
    }
  }

  if (!ready) {
    return <ScreenLoading />;
  }

  if (!season) {
    return (
      <View style={styles.empty}>
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
        <EpisodeImage uri={season.coverUrl} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <Kicker variant="section">TEMPORADA</Kicker>
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
            Analiza los episodios de esta temporada y escribe un cierre
            cinematográfico.
          </Text>
        </View>
        {aiError ? <ErrorText>{aiError}</ErrorText> : null}
        <View style={styles.aiActions}>
          <Button
            title={generating ? "Escribiendo..." : "Generar con IA"}
            onPress={handleGenerateAI}
            loading={generating}
            disabled={season.episodes.length === 0}
            style={styles.aiActionBtn}
          />
          {season.conclusion ? (
            <Button
              title={exporting ? "Creando imagen…" : "Descargar recap (PNG)"}
              variant="secondary"
              onPress={handleDownloadRecap}
              loading={exporting}
              style={styles.aiActionBtn}
            />
          ) : null}
        </View>
        <Text style={season.conclusion ? styles.conclusion : styles.placeholder}>
          {season.conclusion ??
            "Aún no hay conclusión. Pulsa el botón para que la IA cierre esta temporada."}
        </Text>
      </View>

      <SectionTitle>EPISODIOS</SectionTitle>
      <View style={styles.list}>
        {[...season.episodes].reverse().map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} compact />
        ))}
      </View>

      <View style={styles.offscreen} pointerEvents="none">
        <SeasonRecapPoster ref={recapRef} season={season} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  empty: {
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
  aiActions: {
    gap: spacing.sm,
  },
  aiActionBtn: {
    width: "100%",
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    top: 0,
    opacity: 0.01,
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
  list: {
    gap: spacing.sm,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
});
