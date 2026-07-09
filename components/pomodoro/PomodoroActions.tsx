import { lightTheme } from "@/components/colors";
import { PastelCard } from "@/components/home/PastelCard";
import React from "react";
import { Text, View } from "react-native";

interface PomodoroActionsProps {
  theme: typeof lightTheme;
  isRunning: boolean;
  timeLeft: number;
  onStartPause: () => void;
  onStop: () => void;
  startDisabled?: boolean;
  animated?: boolean;
  animationDelay?: number;
}

export function PomodoroActions({
  theme,
  isRunning,
  timeLeft,
  onStartPause,
  onStop,
  startDisabled = false,
  animated = true,
  animationDelay = 240,
}: PomodoroActionsProps) {
  const disabled = timeLeft === 0;
  const startLabel = isRunning ? "Pause" : "Débuter";

  return (
    <View className="flex-row gap-3 mb-3">
      <PastelCard
        theme={theme}
        animated={animated}
        animationDelay={animationDelay}
        onPress={onStartPause}
        disabled={disabled || startDisabled}
        style={{
          flex: 1,
          opacity: disabled || startDisabled ? 0.55 : 1,
          backgroundColor: isRunning
            ? theme.contentWrapperBgColor
            : theme.buttonColor,
          borderColor: theme.cardBorderSoft,
        }}
        contentStyle={{ paddingVertical: 16, alignItems: "center" }}
      >
        <Text
          className="font-pixel text-xl"
          style={{ color: theme.defaultTextColor }}
        >
          {startLabel}
        </Text>
      </PastelCard>

      <PastelCard
        theme={theme}
        animated={animated}
        animationDelay={animationDelay + 60}
        onPress={onStop}
        style={{
          flex: 1,
          backgroundColor: theme.cardSurface,
          borderColor: theme.stopBorderColor,
        }}
        contentStyle={{ paddingVertical: 16, alignItems: "center" }}
      >
        <Text
          className="font-pixel text-xl"
          style={{ color: theme.stopColor }}
        >
          Stop
        </Text>
      </PastelCard>
    </View>
  );
}
