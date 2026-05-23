import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { OptionChip } from "@/components/ui/OptionChip";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <OptionChip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
          style={styles.option}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  option: {
    flex: 1,
  },
});
