import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Button } from "@/components/ui/Button";
import { deleteEpisode, formatEpisodeDate, getEpisodeById, loadEpisodes } from "@/lib/data";
import { getEmotion } from "@/lib/emotions";
import { useResponsive } from "@/lib/responsive";
import type { Episode } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { heroHeight, isDesktop } = useResponsive();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEpisodes().then((eps) => {
      setEpisode(getEpisodeById(eps, id) ?? null);
      setLoading(false);
    });
  }, [id]);

  function confirmDelete() {
    if (!episode) return;

    Alert.alert(
      "Eliminar episodio",
      "¿Seguro que quieres borrar este capítulo? No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleDelete,
        },
      ]
    );
  }

  async function handleDelete() {
    if (!episode) return;

    setDeleting(true);
    try {
      const all = await loadEpisodes();
      await deleteEpisode(episode.id, all);
      router.replace("/");
    } catch (error) {
      console.error("[handleDelete]", error);
      Alert.alert(
        "No se pudo eliminar",
        error instanceof Error ? error.message : "Inténtalo de nuevo."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!episode) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Episodio no encontrado.</Text>
        <Link href="/" style={styles.link}>
          Volver al inicio
        </Link>
      </View>
    );
  }

  const emotion = getEmotion(episode.emotion);

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View
        style={[
          styles.hero,
          { height: heroHeight },
          isDesktop && styles.heroDesktop,
        ]}
      >
        <Image source={{ uri: episode.photoUrl }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <Text style={styles.date}>{formatEpisodeDate(episode.date)}</Text>
          <Text style={styles.title}>{episode.title}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.badges}>
          <Text style={[styles.badge, { color: emotion.color }]}>
            {emotion.emoji} {emotion.label}
          </Text>
          <Text style={styles.badge}>
            <FontAwesome name="music" size={12} color={colors.muted} />{" "}
            {episode.songTitle} — {episode.songArtist}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>PENSAMIENTO</Text>
        <Text style={styles.thought}>&ldquo;{episode.thought}&rdquo;</Text>

        {episode.songUrl ? (
          <Text style={styles.songLink} onPress={() => Linking.openURL(episode.songUrl!)}>
            Escuchar canción →
          </Text>
        ) : null}

        <Button
          title={`Ver temporada ${episode.seasonYear}`}
          variant="secondary"
          onPress={() => router.push(`/season/${episode.seasonYear}`)}
        />

        <Button
          title="Eliminar episodio"
          variant="danger"
          onPress={confirmDelete}
          loading={deleting}
          disabled={deleting}
        />
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
    gap: spacing.md,
  },
  muted: {
    color: colors.muted,
  },
  link: {
    color: colors.accent,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.lg,
    width: "100%",
  },
  heroDesktop: {
    maxHeight: 320,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroText: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  date: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 30,
    maxWidth: 640,
  },
  body: {
    gap: spacing.md,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  badges: {
    gap: spacing.sm,
  },
  badge: {
    color: colors.muted,
    fontSize: 14,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  thought: {
    color: colors.foreground,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 640,
  },
  songLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
});
