import { useMemo, useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { EpisodeImage } from "@/components/EpisodeImage";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenLoading } from "@/components/ScreenLoading";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { useEpisodes } from "@/hooks/useEpisodes";
import { confirmDestructive } from "@/lib/confirm";
import { formatEpisodeDate, getEpisodeById } from "@/lib/data";
import { ensureSupabaseSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getEmotion } from "@/lib/emotions";
import { formatEpisodeLocation } from "@/lib/location";
import { useResponsive } from "@/lib/responsive";
import { colors, radius, spacing } from "@/lib/theme";

function normalizeId(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0];
  return id ?? "";
}

export default function EpisodeDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = normalizeId(params.id);
  const { heroHeight, isDesktop } = useResponsive();
  const { episodes, ready, removeEpisode } = useEpisodes();
  const [deleting, setDeleting] = useState(false);

  const episode = useMemo(() => {
    if (!ready || !id) return null;
    return getEpisodeById(episodes, id) ?? null;
  }, [id, episodes, ready]);

  async function confirmDelete() {
    if (!episode) return;

    const ok = await confirmDestructive(
      "Eliminar episodio",
      "¿Seguro que quieres borrar este capítulo? No se puede deshacer."
    );
    if (ok) await handleDelete();
  }

  async function handleDelete() {
    if (!episode) return;

    setDeleting(true);
    try {
      if (isSupabaseConfigured()) {
        await ensureSupabaseSession();
      }
      const { deletedFromCloud } = await removeEpisode(episode.id);
      router.replace("/");
      if (!deletedFromCloud && isSupabaseConfigured()) {
        Alert.alert(
          "Eliminado en pantalla",
          "No se pudo borrar en Supabase (sesión distinta a la que creó el episodio). En Supabase → Table Editor → episodes puedes borrar la fila manualmente, o en el navegador: Ajustes del sitio → Borrar datos."
        );
      }
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

  if (!ready) {
    return <ScreenLoading />;
  }

  if (!episode) {
    return (
      <View style={styles.empty}>
        <Text style={styles.muted}>Episodio no encontrado.</Text>
        <Link href="/" style={styles.link}>
          Volver al inicio
        </Link>
      </View>
    );
  }

  const emotion = getEmotion(episode.emotion);
  const locationLabel = formatEpisodeLocation(episode);

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View
        style={[
          styles.hero,
          { height: heroHeight },
          isDesktop && styles.heroDesktop,
        ]}
      >
        <EpisodeImage uri={episode.photoUrl} style={styles.heroImage} />
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

        {locationLabel ? (
          <View style={styles.locationRow}>
            <FontAwesome name="map-marker" size={14} color={colors.accent} />
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>
        ) : null}

        <Kicker variant="label">PENSAMIENTO</Kicker>
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
  empty: {
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
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationText: {
    color: colors.foreground,
    fontSize: 14,
    flex: 1,
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
