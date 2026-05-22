import { Alert, Platform } from "react-native";

/** Confirmación genérica (web + móvil). */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = "Aceptar"
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(
      window.confirm(`${title}\n\n${message}\n\nPulsa Aceptar para continuar.`)
    );
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ]);
  });
}

/** Confirmación que funciona en web (Alert.alert con botones no llama onPress en RN Web). */
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
