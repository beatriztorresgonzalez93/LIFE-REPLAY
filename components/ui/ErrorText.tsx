import { StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

export function ErrorText({ children }: { children: string }) {
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
