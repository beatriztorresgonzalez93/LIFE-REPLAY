import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { EpisodeCard } from "@/components/EpisodeCard";
import { SeasonCard } from "@/components/SeasonCard";
import { Button } from "@/components/ui/Button";
import { useEpisodes } from "@/hooks/useEpisodes";
import { colors, radius, spacing } from "@/lib/theme";

export default function HomeScreen() {
  const { episodes, seasons, ready } = useEpisodes();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>Cargando tu archivo...</Text>
      </View>
    );
  }

  const recent = [...episodes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>LIFE REPLAY</Text>
          <Text style={styles.title}>Tu vida, episodio a episodio</Text>
          <Text style={styles.subtitle}>
            Cada día: una foto, un pensamiento, una canción y una emoción. Tu
            historia como una serie.
          </Text>
          <View style={styles.heroActions}>
            <Button
              title="Grabar episodio de hoy"
              onPress={() => router.push("/episode/new")}
            />
            {seasons[0] && (
              <Button
                title={`Ver temporada ${seasons[0].year}`}
                variant="secondary"
                onPress={() => router.push(`/season/${seasons[0].year}`)}
              />
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TUS TEMPORADAS</Text>
          <FontAwesome name="magic" size={16} color={colors.accent} />
        </View>
        <View style={styles.seasonGrid}>
          {seasons.map((season) => (
            <View key={season.year} style={styles.seasonItem}>
              <SeasonCard season={season} />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.recentTitle]}>EPISODIOS RECIENTES</Text>
        <View style={styles.episodeList}>
          {recent.slice(0, 5).map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.muted,
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  heroActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  seasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  seasonItem: {
    width: "47%",
    flexGrow: 1,
  },
  recentTitle: {
    marginTop: spacing.sm,
  },
  episodeList: {
    gap: spacing.sm,
  },
});
