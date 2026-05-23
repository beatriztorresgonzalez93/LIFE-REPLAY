import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/lib/theme";

function HeaderSignOut() {
  const { user, signOut } = useAuth();

  if (!isSupabaseConfigured() || !user) {
    return null;
  }

  return (
    <Pressable
      onPress={() => signOut()}
      style={{ marginRight: 16 }}
      hitSlop={8}
      accessibilityLabel="Cerrar sesión"
    >
      <FontAwesome name="sign-out" size={22} color={colors.muted} />
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        headerRight: () => <HeaderSignOut />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Life Replay",
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
