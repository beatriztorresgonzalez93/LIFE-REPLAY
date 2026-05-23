import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from "react-native";
import { useResponsive } from "@/lib/responsive";
import { colors, spacing } from "@/lib/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  contentStyle?: ViewStyle;
  style?: ViewStyle;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "style" | "children">;
}

export function ScreenContainer({
  children,
  scroll = false,
  keyboardAware = false,
  contentStyle,
  style,
  scrollProps,
}: ScreenContainerProps) {
  const { pagePadding, maxContentWidth } = useResponsive();

  const baseContentStyle: ViewStyle = {
    width: "100%",
    maxWidth: maxContentWidth,
    paddingHorizontal: pagePadding,
    alignSelf: "center",
  };

  if (scroll) {
    const scrollView = (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[baseContentStyle, styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={keyboardAware}
        keyboardShouldPersistTaps={keyboardAware ? "handled" : undefined}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );

    if (keyboardAware) {
      return (
        <KeyboardAvoidingView
          style={[styles.outer, style]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {scrollView}
        </KeyboardAvoidingView>
      );
    }

    return <View style={[styles.outer, style]}>{scrollView}</View>;
  }

  return (
    <View style={[styles.outer, style]}>
      <View style={[baseContentStyle, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
