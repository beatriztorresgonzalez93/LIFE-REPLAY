import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Button } from "@/components/ui/Button";
import { EmotionPicker } from "@/components/ui/EmotionPicker";
import { Field } from "@/components/ui/Field";
import { PhotoPicker } from "@/components/ui/PhotoPicker";
import { useEpisodes } from "@/hooks/useEpisodes";
import { ensureSupabaseSession } from "@/lib/auth";
import { formatEpisodeDate, saveNewEpisode, todayIsoDate } from "@/lib/data";
import { uploadEpisodePhoto } from "@/lib/uploadPhoto";
import { DEFAULT_EPISODE_PHOTO } from "@/lib/episodePhoto";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Emotion } from "@/lib/types";
import { colors, spacing } from "@/lib/theme";

export default function NewEpisodeScreen() {
  const { episodes, setEpisodes } = useEpisodes();
  const [thought, setThought] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("hope");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentYear = new Date().getFullYear();
  const [seasonYear, setSeasonYear] = useState(currentYear);
  const [date, setDate] = useState(todayIsoDate());

  const seasonYears = useMemo(() => {
    const years = new Set(episodes.map((e) => e.seasonYear));
    years.add(currentYear);
    return [...years].sort((a, b) => b - a);
  }, [episodes, currentYear]);

  async function handleSave() {
    if (!thought.trim() || !songTitle.trim() || !songArtist.trim()) {
      Alert.alert("Faltan datos", "Completa pensamiento, canción y artista.");
      return;
    }

    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        await ensureSupabaseSession();
      }

      let photoUrl = DEFAULT_EPISODE_PHOTO;
      if (photoUri) {
        try {
          photoUrl = await uploadEpisodePhoto(photoUri);
        } catch (photoError) {
          console.warn("[handleSave] foto:", photoError);
          Alert.alert(
            "Foto no subida",
            "Se guardará el episodio con una imagen por defecto. Puedes cambiarla editando más tarde."
          );
        }
      }

      const { episode, savedToCloud } = await saveNewEpisode(
        {
          thought: thought.trim(),
          songTitle: songTitle.trim(),
          songArtist: songArtist.trim(),
          songUrl: songUrl.trim() || undefined,
          emotion,
          photoUrl,
          seasonYear,
          date: date.trim() || undefined,
        },
        episodes
      );

      if (!savedToCloud && isSupabaseConfigured()) {
        Alert.alert(
          "Guardado parcial",
          "El episodio se guardó en este navegador pero no en la base de datos."
        );
      } else if (!isSupabaseConfigured()) {
        Alert.alert(
          "Solo en este navegador",
          "Para guardar en Supabase, configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en Vercel y haz Redeploy."
        );
      }

      setEpisodes([episode, ...episodes]);
      router.replace(`/episode/${episode.id}`);
    } catch (error) {
      console.error("[handleSave]", error);
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error
          ? error.message
          : "Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScreenContainer
          scroll
          contentStyle={styles.content}
          scrollProps={{ keyboardShouldPersistTaps: "handled" }}
        >
          <Text style={styles.kicker}>NUEVO CAPÍTULO</Text>
          <Text style={styles.title}>Nuevo episodio</Text>
          <Text style={styles.subtitle}>
            Se suma a los episodios de demo que ya tienes. Foto opcional (si falla
            la subida, se usa una imagen por defecto).
          </Text>

          <View style={styles.block}>
            <Text style={styles.label}>Temporada</Text>
            <View style={styles.yearRow}>
              {seasonYears.map((year) => (
                <Pressable
                  key={year}
                  style={[styles.yearChip, seasonYear === year && styles.yearChipActive]}
                  onPress={() => setSeasonYear(year)}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      seasonYear === year && styles.yearChipTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field
            label="Fecha"
            placeholder="2026-05-21"
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />
          {/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? (
            <Text style={styles.datePreview}>{formatEpisodeDate(date.trim())}</Text>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.label}>Foto del día</Text>
            <PhotoPicker value={photoUri} onChange={setPhotoUri} />
          </View>

          <Field
            label="Pensamiento del día"
            placeholder="¿Qué pasó hoy? Voz en off de tu episodio..."
            value={thought}
            onChangeText={setThought}
            multiline
            style={styles.textarea}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Field
                label="Canción"
                placeholder="Título"
                value={songTitle}
                onChangeText={setSongTitle}
              />
            </View>
            <View style={styles.rowItem}>
              <Field
                label="Artista"
                placeholder="Artista"
                value={songArtist}
                onChangeText={setSongArtist}
              />
            </View>
          </View>

          <Field
            label="Enlace (opcional)"
            placeholder="Spotify, YouTube..."
            value={songUrl}
            onChangeText={setSongUrl}
            autoCapitalize="none"
          />

          <View style={styles.block}>
            <Text style={styles.label}>Emoción principal</Text>
            <EmotionPicker value={emotion} onChange={setEmotion} />
          </View>

          <Button
            title={`Guardar en temporada ${seasonYear}`}
            onPress={handleSave}
            loading={saving}
          />
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    maxWidth: 720,
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  title: {
    color: colors.foreground,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  datePreview: {
    color: colors.accent,
    fontSize: 13,
    marginTop: -4,
  },
  block: {
    gap: spacing.sm,
  },
  label: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
    minWidth: 200,
  },
  yearRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  yearChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  yearChipText: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  yearChipTextActive: {
    color: colors.foreground,
  },
});
