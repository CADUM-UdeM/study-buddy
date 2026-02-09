import { colors } from "@/app/theme/colors";
import React from "react";
import { View, ViewStyle } from "react-native";

type AppBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Wraps screen content with the app's theme background.
 * Use as the root container for full-screen pages so background color is consistent.
 */
export default function AppBackground({ children, style }: AppBackgroundProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.darkAmethyst }, style]}>
      {children}
    </View>
  );
}
