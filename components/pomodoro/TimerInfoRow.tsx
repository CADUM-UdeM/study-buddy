import { lightTheme } from "@/components/colors";
import { getPastelChipStyle, PastelCard } from "@/components/home/PastelCard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface TimerInfoRowProps {
  theme: typeof lightTheme;
  pomodoroDuration: string;
  breakDuration: string;
  numCycle: number;
  animated?: boolean;
  animationDelay?: number;
}

function StatChip({
  theme,
  icon,
  label,
}: {
  theme: typeof lightTheme;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      className="flex-1 flex-row items-center justify-center gap-2 py-3 px-2 rounded-2xl"
      style={getPastelChipStyle(theme)}
    >
      <Ionicons name={icon} size={18} color={theme.activeColorIcon} />
      <Text
        className="font-pixel text-base"
        style={{ color: theme.defaultTextColor }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function TimerInfoRow({
  theme,
  pomodoroDuration,
  breakDuration,
  numCycle,
  animated = true,
  animationDelay = 120,
}: TimerInfoRowProps) {
  return (
    <PastelCard
      theme={theme}
      animated={animated}
      animationDelay={animationDelay}
      className="mb-3"
      contentStyle={{ padding: 14 }}
    >
      <View className="flex-row gap-2">
        <StatChip
          theme={theme}
          icon="time-outline"
          label={`${pomodoroDuration} min`}
        />
        <StatChip
          theme={theme}
          icon="cafe-outline"
          label={`${breakDuration} min`}
        />
        <StatChip theme={theme} icon="refresh-outline" label={`×${numCycle}`} />
      </View>
    </PastelCard>
  );
}
