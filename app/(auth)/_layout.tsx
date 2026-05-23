import { Stack } from "expo-router";
import { stackScreenOptions } from "@/lib/navigation";

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
