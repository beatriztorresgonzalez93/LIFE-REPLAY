import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <>
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
    </>
  );
}
