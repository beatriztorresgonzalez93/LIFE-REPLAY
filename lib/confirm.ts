import { Alert, Platform } from "react-native";

/** Confirmación destructiva (web + móvil). */
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel = "Eliminar"
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(
      window.confirm(`${title}\n\n${message}\n\nPulsa Aceptar para ${confirmLabel.toLowerCase()}.`)
    );
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: "destructive",
        onPress: () => resolve(true),
      },
    ]);
  });
}
