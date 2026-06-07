import { Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopStatusBarGuardProps = {
  backgroundColor: string;
  opacity?: Animated.AnimatedInterpolation<number> | number;
};

export function TopStatusBarGuard({
  backgroundColor,
  opacity = 1,
}: TopStatusBarGuardProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.guard,
        {
          backgroundColor,
          height: insets.top + 8,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  guard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});
