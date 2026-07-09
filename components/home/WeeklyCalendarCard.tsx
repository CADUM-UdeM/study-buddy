import { lightTheme } from "@/components/colors";
import { PastelCard } from "@/components/home/PastelCard";
import { WeeklyCalendarPreview } from "@/components/home/WeeklyCalendarPreview";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface WeeklyCalendarCardProps {
  theme: typeof lightTheme;
  animated?: boolean;
  animationDelay?: number;
}

export function WeeklyCalendarCard({
  theme,
  animated = false,
  animationDelay = 0,
}: WeeklyCalendarCardProps) {
  const router = useRouter();
  const weekLabel = format(new Date(), "MMMM yyyy", { locale: fr });

  const openWeeklyCalendar = () => {
    router.push({
      pathname: "/(tabs)/calendar",
      params: { view: "week" },
    });
  };

  return (
    <PastelCard
      theme={theme}
      animated={animated}
      animationDelay={animationDelay}
      onPress={openWeeklyCalendar}
      className="mb-3"
      contentStyle={{ padding: 16 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text
            className="font-pixel text-lg"
            style={{ color: theme.defaultTextColor }}
          >
            Cette semaine
          </Text>
          <Text
            className="font-pixel text-xs capitalize mt-0.5"
            style={{ color: theme.gray }}
          >
            {weekLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="font-pixel text-xs" style={{ color: theme.activeTextColor }}>
            Voir tout
          </Text>
          <ChevronRight size={16} color={theme.activeTextColor} strokeWidth={2} />
        </View>
      </View>

      <WeeklyCalendarPreview theme={theme} />
    </PastelCard>
  );
}
