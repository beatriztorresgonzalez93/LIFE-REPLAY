import { Platform, useWindowDimensions } from "react-native";

export const LAYOUT = {
  maxContentWidth: 1080,
  narrowPadding: 16,
  desktopPadding: 28,
  desktopBreakpoint: 768,
  wideBreakpoint: 1100,
} as const;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= LAYOUT.desktopBreakpoint;
  const isWide = width >= LAYOUT.wideBreakpoint;

  const pagePadding = isDesktop ? LAYOUT.desktopPadding : LAYOUT.narrowPadding;
  const contentWidth = Math.min(width - pagePadding * 2, LAYOUT.maxContentWidth);

  return {
    isWeb,
    isDesktop,
    isWide,
    width,
    pagePadding,
    contentWidth,
    maxContentWidth: LAYOUT.maxContentWidth,
    seasonColumns: isWide ? 3 : isDesktop ? 2 : 2,
    heroHeight: isDesktop ? 300 : 240,
    seasonCoverMaxHeight: isDesktop ? 260 : undefined,
    photoPreviewMaxHeight: isDesktop ? 280 : undefined,
    thumb: isDesktop ? { width: 84, height: 96 } : { width: 72, height: 88 },
    emotionColumns: isDesktop ? 4 : 2,
  };
}
