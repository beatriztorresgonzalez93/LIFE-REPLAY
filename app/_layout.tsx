import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { EpisodesProvider } from "@/contexts/EpisodesContext";
import { getSupabaseConfigDebug, isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      const debug = getSupabaseConfigDebug();
      console.info("[Life Replay] Supabase en web:", {
        configurado: isSupabaseConfigured(),
        ...debug,
      });
    }
  }, []);

  return (
    <EpisodesProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="episode/new"
          options={{ title: "Nuevo episodio", presentation: "modal" }}
        />
        <Stack.Screen name="episode/[id]" options={{ title: "Episodio" }} />
        <Stack.Screen name="season/[year]" options={{ title: "Temporada" }} />
      </Stack>
    </EpisodesProvider>
  );
}
