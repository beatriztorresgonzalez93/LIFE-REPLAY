import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { EpisodeCard } from "@/components/EpisodeCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenLoading } from "@/components/ScreenLoading";
import { SeasonCard } from "@/components/SeasonCard";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useResponsive } from "@/lib/responsive";
import { colors, radius, spacing } from "@/lib/theme";

export default function HomeScreen() {
  const { episodes, seasons, ready } = useEpisodes();
  const { isDesktop, isWide } = useResponsive();

  if (!ready) {
    return <ScreenLoading message="Cargando tu archivo..." />;
  }

  const recent = [...episodes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenContainer scroll contentStyle={styles.content}>
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <Kicker variant="section">LIFE REPLAY</Kicker>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
            Tu vida, episodio a episodio
          </Text>
          <Text style={styles.subtitle}>
            Los episodios de demo y los tuyos conviven: pulsa «Grabar episodio de
            hoy» para añadir los tuyos a cualquier temporada.
          </Text>
          <View style={[styles.heroActions, isDesktop && styles.heroActionsDesktop]}>
            <Button
              title="Grabar episodio de hoy"
              onPress={() => router.push("/episode/new")}
              style={isDesktop ? styles.heroButton : undefined}
            />
            {seasons[0] && (
              <Button
                title={`Ver temporada ${seasons[0].year}`}
                variant="secondary"
                onPress={() => router.push(`/season/${seasons[0].year}`)}
                style={isDesktop ? styles.heroButton : undefined}
              />
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitle>TUS TEMPORADAS</SectionTitle>
          <FontAwesome name="magic" size={16} color={colors.accent} />
        </View>
        <View style={styles.seasonGrid}>
          {seasons.map((season) => (
            <View
              key={season.year}
              style={[
                styles.seasonItem,
                isWide && styles.seasonItemWide,
                isDesktop && !isWide && styles.seasonItemDesktop,
              ]}
            >
              <SeasonCard season={season} />
            </View>
          ))}
        </View>

        <SectionTitle>EPISODIOS RECIENTES</SectionTitle>
        <View style={styles.episodeList}>
          {recent.slice(0, 5).map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroDesktop: {
    padding: spacing.xl,
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  titleDesktop: {
    fontSize: 36,
    lineHeight: 42,
    maxWidth: 560,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
    maxWidth: 520,
  },
  heroActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  heroActionsDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heroButton: {
    flexGrow: 0,
    minWidth: 220,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  seasonItem: {
    width: "47%",
    flexGrow: 1,
    maxWidth: "100%",
  },
  seasonItemDesktop: {
    width: "48%",
    maxWidth: 360,
  },
  seasonItemWide: {
    width: "31%",
    maxWidth: 320,
  },
  episodeList: {
    gap: spacing.sm,
  },
});
