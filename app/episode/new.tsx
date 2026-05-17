import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { saveNewEpisode } from "@/lib/data";
import { uploadEpisodePhoto } from "@/lib/uploadPhoto";
import type { Emotion } from "@/lib/types";
import { colors, spacing } from "@/lib/theme";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80";

export default function NewEpisodeScreen() {
  const { episodes, setEpisodes } = useEpisodes();
  const [thought, setThought] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("hope");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!thought.trim() || !songTitle.trim() || !songArtist.trim()) {
      Alert.alert("Faltan datos", "Completa pensamiento, canción y artista.");
      return;
    }

    setSaving(true);
    try {
      const photoUrl = photoUri
        ? await uploadEpisodePhoto(photoUri)
        : DEFAULT_PHOTO;

      const episode = await saveNewEpisode(
        {
          thought: thought.trim(),
          songTitle: songTitle.trim(),
          songArtist: songArtist.trim(),
          songUrl: songUrl.trim() || undefined,
          emotion,
          photoUrl,
        },
        episodes
      );
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
          <Text style={styles.title}>Episodio de hoy</Text>
          <Text style={styles.subtitle}>
            Haz una foto con la cámara o elige una de tu galería.
          </Text>

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

          <Button title="Guardar episodio de hoy" onPress={handleSave} loading={saving} />
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
});
