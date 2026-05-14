import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors, radius, spacing } from "@/lib/theme";

interface PhotoPickerProps {
  value: string | null;
  onChange: (uri: string) => void;
}

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const [loading, setLoading] = useState(false);

  async function ensureCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso de cámara",
        "Necesitamos acceso a la cámara para tomar la foto del día."
      );
      return false;
    }
    return true;
  }

  async function ensureLibraryPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso de galería",
        "Necesitamos acceso a tus fotos para elegir una imagen."
      );
      return false;
    }
    return true;
  }

  async function takePhoto() {
    if (!(await ensureCameraPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickFromGallery() {
    if (!(await ensureLibraryPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.preview} onPress={pickFromGallery}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome name="image" size={32} color={colors.muted} />
            <Text style={styles.placeholderText}>Añade la foto del episodio</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, styles.cameraBtn]}
          onPress={takePhoto}
          disabled={loading}
        >
          <FontAwesome name="camera" size={18} color="#fff" />
          <Text style={styles.actionTextPrimary}>Hacer foto</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.galleryBtn]}
          onPress={pickFromGallery}
          disabled={loading}
        >
          <FontAwesome name="photo" size={18} color={colors.foreground} />
          <Text style={styles.actionTextSecondary}>Subir de galería</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  preview: {
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: radius.md,
  },
  cameraBtn: {
    backgroundColor: colors.accent,
  },
  galleryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTextPrimary: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionTextSecondary: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
});
