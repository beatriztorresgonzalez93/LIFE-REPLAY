import { Platform } from "react-native";

/**
 * Almacenamiento clave-valor: AsyncStorage en móvil, localStorage en web.
 */
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  }
  const AsyncStorage = (await import("@react-native-async-storage/async-storage"))
    .default;
  return AsyncStorage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
    return;
  }
  const AsyncStorage = (await import("@react-native-async-storage/async-storage"))
    .default;
  await AsyncStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    return;
  }
  const AsyncStorage = (await import("@react-native-async-storage/async-storage"))
    .default;
  await AsyncStorage.removeItem(key);
}
