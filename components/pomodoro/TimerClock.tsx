import { lightTheme } from "@/components/colors";
import { getPastelChipStyle, PastelCard } from "@/components/home/PastelCard";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface TimerClockProps {
  theme: typeof lightTheme;
  inBreakTime: boolean;
  phaseTotalSeconds: number;
  timeLeft: number;
  hours: string;
  min: string;
  sec: string;
  isRunning: boolean;
  setClickParam: React.Dispatch<React.SetStateAction<boolean>>;
  remainingCycle: number;
  animated?: boolean;
  animationDelay?: number;
}

export function TimerClock({
  theme,
  inBreakTime,
  phaseTotalSeconds,
  timeLeft,
  hours,
  min,
  sec,
  isRunning,
  setClickParam,
  remainingCycle,
  animated = true,
  animationDelay = 0,
}: TimerClockProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!isRunning) {
      pulse.value = withTiming(0, { duration: 300 });
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [isRunning, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isRunning
          ? interpolate(pulse.value, [0, 1], [1, 1.015])
          : 1,
      },
    ],
  }));

  const progress =
    phaseTotalSeconds > 0 ? (timeLeft / phaseTotalSeconds) * 100 : 100;

  return (
    <PastelCard
      theme={theme}
      animated={animated}
      animationDelay={animationDelay}
      className="mb-3"
      style={{
        backgroundColor: inBreakTime ? theme.cardGlow : theme.cardSurface,
        borderColor: inBreakTime ? theme.activeColorIcon : theme.cardBorderSoft,
      }}
      contentStyle={{ padding: 24, alignItems: "center" }}
    >
      <View
        className="px-4 py-1.5 rounded-full mb-5"
        style={getPastelChipStyle(theme)}
      >
        <Text
          className="font-pixel text-base"
          style={{ color: inBreakTime ? theme.activeTextColor : theme.defaultTextColor }}
        >
          {inBreakTime ? "Pause" : "Focus"}
        </Text>
      </View>

      <Animated.View style={ringStyle}>
        <AnimatedCircularProgress
          size={188}
          width={9}
          fill={progress}
          tintColor={inBreakTime ? theme.activeTextColor : theme.circleColor}
          backgroundColor={theme.contentWrapperBgColor}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Text
              className="text-3xl font-pixel"
              style={{ color: theme.defaultTextColor }}
            >
              {hours}:{min}:{sec}
            </Text>
          )}
        </AnimatedCircularProgress>
      </Animated.View>

      <View className="flex-row items-center justify-center gap-4 mt-6">
        <Pressable
          onPress={() => setClickParam(true)}
          disabled={isRunning}
          className="rounded-full p-2.5"
          style={[
            getPastelChipStyle(theme),
            isRunning && { opacity: 0.45 },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={theme.activeColorIcon}
          />
        </Pressable>

        <View className="px-4 py-2 rounded-xl" style={getPastelChipStyle(theme)}>
          <Text
            className="font-pixel text-base"
            style={{ color: theme.activeTextColor }}
          >
            Cycle · {remainingCycle}
          </Text>
        </View>
      </View>
    </PastelCard>
  );
}
