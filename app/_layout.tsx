import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { EpisodesProvider } from "@/contexts/EpisodesContext";
import { stackScreenOptions } from "@/lib/navigation";
import { requestLocationPermissionOnLaunch } from "@/lib/location";
import { getSupabaseConfigDebug, isSupabaseConfigured } from "@/lib/supabase";

export default function RootLayout() {
  useEffect(() => {
    void requestLocationPermissionOnLaunch();

    if (__DEV__ && Platform.OS === "web") {
      const debug = getSupabaseConfigDebug();
      console.info("[Life Replay] Supabase en web:", {
        configurado: isSupabaseConfigured(),
        ...debug,
      });
    }
  }, []);

  return (
    <AuthProvider>
      <AuthGate>
        <EpisodesProvider>
          <StatusBar style="light" />
          <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="episode/new"
              options={{ title: "Nuevo episodio", presentation: "modal" }}
            />
            <Stack.Screen name="episode/[id]" options={{ title: "Episodio" }} />
            <Stack.Screen name="season/[year]" options={{ title: "Temporada" }} />
          </Stack>
        </EpisodesProvider>
      </AuthGate>
    </AuthProvider>
  );
}
