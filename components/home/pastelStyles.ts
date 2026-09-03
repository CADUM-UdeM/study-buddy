import { lightTheme } from "@/components/colors";
import { Platform, ViewStyle } from "react-native";

export function getPastelSurfaceStyle(
  theme: typeof lightTheme,
  overrides?: ViewStyle,
): ViewStyle {
  return {
    backgroundColor: theme.cardSurface,
    borderWidth: 1.5,
    borderColor: theme.cardBorderSoft,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: theme.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.cardShadowOpacity,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
    ...overrides,
  };
}

export function getPastelChipStyle(theme: typeof lightTheme, overrides?: ViewStyle
): ViewStyle  {
  return {
    backgroundColor: theme.cardGlow,
    borderWidth: 1,
    borderColor: theme.cardBorderSoft,
    borderRadius: 14,
    ...overrides,
  };
}
