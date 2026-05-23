import { StyleSheet, Text, type TextProps } from "react-native";
import { colors } from "@/lib/theme";

type KickerVariant = "brand" | "section" | "overlay" | "label";

interface KickerProps extends TextProps {
  variant?: KickerVariant;
}

export function Kicker({ variant = "section", style, ...props }: KickerProps) {
  return <Text style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  brand: {
    color: colors.accent,
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: "700",
  },
  section: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  overlay: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
});
