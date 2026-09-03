import { lightTheme } from "@/components/colors";
import { getPastelChipStyle, PastelCard } from "@/components/home/PastelCard";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
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
  numCycle: number;
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
  numCycle,
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

        {/* --- Nombre de cycle restant ---*/}
        <View style={{alignItems: 'center', gap: 8, paddingTop: 20,}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                {Array.from({length: numCycle}).map((_, i) => {
                    const isActive = i === (numCycle - remainingCycle);
                    const isDone = i < (numCycle - remainingCycle);
                    let color = theme.cycleDefault;
                    if (isActive) color = theme.cycleActive;
                    if (isDone) color = theme.cycleInactive;
                    return (
                        <View key={i} style={{
                            height: 7, borderRadius: 40,
                            width: isActive ? 20 : 7, backgroundColor: color,
                        }}/>);
                })}
            </View>

        </View>
        {/* ------ */}
    </PastelCard>
  );
}
