import { lightTheme } from "@/components/colors";
import React, { useEffect } from "react";
import {
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { getPastelSurfaceStyle } from "./pastelStyles";

export { getPastelChipStyle, getPastelSurfaceStyle } from "./pastelStyles";

interface PastelCardProps {
  children: React.ReactNode;
  theme: typeof lightTheme;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
  animated?: boolean;
  animationDelay?: number;
  onPress?: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PastelCard({
  children,
  theme,
  style,
  contentStyle,
  className,
  animated = false,
  animationDelay = 0,
  onPress,
  disabled,
}: PastelCardProps) {
  const float = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

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
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animated, animationDelay, float]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return {
        transform: [{ scale: 1 - press.value * 0.02 }],
      };
    }

    return {
      transform: [
        { translateY: interpolate(float.value, [0, 1], [0, -4]) },
        {
          scale:
            interpolate(float.value, [0, 1], [1, 1.012]) *
            (1 - press.value * 0.02),
        },
      ],
    };
  });

  const surfaceStyle = getPastelSurfaceStyle(theme);
  const body = (
    <View style={[{ padding: 16 }, contentStyle]}>{children}</View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          press.value = withSpring(1, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          press.value = withSpring(0, { damping: 16, stiffness: 320 });
        }}
        className={className}
        style={[surfaceStyle, animatedStyle, style]}
      >
        {body}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View
      className={className}
      style={[surfaceStyle, animatedStyle, style]}
    >
      {body}
    </Animated.View>
  );
}
