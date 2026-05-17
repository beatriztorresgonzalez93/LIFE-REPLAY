import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Almacenamiento persistente (AsyncStorage v2 — compatible con Expo Go).
 * En web usa localStorage internamente.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn("[storage] getItem failed", error);
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn("[storage] setItem failed", error);
    throw error;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("[storage] removeItem failed", error);
  }
}
