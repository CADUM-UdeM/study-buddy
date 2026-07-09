import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function seedToDelay(seed: string | number): number {
  if (typeof seed === "number") {
    return (seed % 6) * 200;
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 900;
  }
  return hash;
}

export function useIdleFloatStyle(seed: string | number = 0) {
  const float = useSharedValue(0);
  const delay = seedToDelay(seed);

  useEffect(() => {
    const timer = setTimeout(() => {
      float.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, float]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -3]) },
      { scale: interpolate(float.value, [0, 1], [1, 1.012]) },
    ],
  }));
}

interface IdleFloatProps {
  children: React.ReactNode;
  seed?: string | number;
  style?: StyleProp<ViewStyle>;
}

export function IdleFloat({ children, seed = 0, style }: IdleFloatProps) {
  const animatedStyle = useIdleFloatStyle(seed);

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}
