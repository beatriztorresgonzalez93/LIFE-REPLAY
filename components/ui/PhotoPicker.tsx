import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useResponsive } from "@/lib/responsive";
import { colors, radius, spacing } from "@/lib/theme";

interface PhotoPickerProps {
  value: string | null;
  onChange: (uri: string) => void;
}

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const { photoPreviewMaxHeight } = useResponsive();
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

  function uriFromAsset(asset: ImagePicker.ImagePickerAsset) {
    if (Platform.OS === "web" && asset.base64) {
      const mime = asset.mimeType ?? "image/jpeg";
      return `data:${mime};base64,${asset.base64}`;
    }
    return asset.uri;
  }

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.85,
    base64: Platform.OS === "web",
  };

  async function takePhoto() {
    if (!(await ensureCameraPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      if (!result.canceled && result.assets[0]) {
        onChange(uriFromAsset(result.assets[0]));
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickFromGallery() {
    if (!(await ensureLibraryPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled && result.assets[0]) {
        onChange(uriFromAsset(result.assets[0]));
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
          <View
            style={[
              styles.placeholder,
              photoPreviewMaxHeight ? { maxHeight: photoPreviewMaxHeight } : null,
            ]}
          >
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
    maxHeight: 280,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    minHeight: 160,
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
