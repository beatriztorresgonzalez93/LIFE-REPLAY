import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/lib/theme";

interface OptionChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OptionChip({ label, selected, onPress, style }: OptionChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  text: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  textSelected: {
    color: colors.foreground,
  },
});
