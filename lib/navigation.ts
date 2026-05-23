import { colors } from "@/lib/theme";

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.foreground,
  headerTitleStyle: { fontWeight: "600" as const },
  contentStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};
