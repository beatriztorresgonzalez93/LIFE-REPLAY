import { Pressable, StyleSheet, Text, View } from "react-native";
import { EMOTIONS } from "@/lib/emotions";
import type { Emotion } from "@/lib/types";
import { colors, radius, spacing } from "@/lib/theme";

interface EmotionPickerProps {
  value: Emotion;
  onChange: (emotion: Emotion) => void;
}

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
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
              selected && { borderColor: colors.accent, backgroundColor: `${colors.accent}22` },
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
    width: "47%",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
