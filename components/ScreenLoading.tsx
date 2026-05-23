import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

interface ScreenLoadingProps {
  message?: string;
  size?: "small" | "large";
}

export function ScreenLoading({ message, size = "large" }: ScreenLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size={size} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  message: {
    color: colors.muted,
  },
});
