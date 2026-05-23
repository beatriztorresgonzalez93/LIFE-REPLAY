import { StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
