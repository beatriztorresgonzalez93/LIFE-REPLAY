import { EMOTIONS } from "@/lib/emotions";
import { useResponsive } from "@/lib/responsive";
import type { Emotion } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EmotionPickerProps {
  value: Emotion;
  onChange: (emotion: Emotion) => void;
}

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  const { emotionColumns } = useResponsive();
  const itemBasis = emotionColumns === 4 ? "23%" : "47%";

  return (
    <View style={styles.grid}>
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion.id;
        return (
          <Pressable
            key={emotion.id}
            onPress={() => onChange(emotion.id)}
            style={[
              styles.item,
              { flexBasis: itemBasis, maxWidth: itemBasis },
              selected && styles.itemSelected,
            ]}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={styles.label}>{emotion.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  item: {
    flexGrow: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
});
