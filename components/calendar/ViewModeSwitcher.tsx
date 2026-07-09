import { lightTheme } from "@/components/colors";
import { getPastelSurfaceStyle } from "@/components/home/pastelStyles";
import { CalendarViewMode } from "@/components/calendar/calendarTheme";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const MODES: { key: CalendarViewMode; label: string }[] = [
  { key: "day", label: "Jour" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
];

interface ViewModeSwitcherProps {
  value: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
  theme: typeof lightTheme;
}

export function ViewModeSwitcher({
  value,
  onChange,
  theme,
}: ViewModeSwitcherProps) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const selectedIndex = MODES.findIndex((mode) => mode.key === value);

  useEffect(() => {
    if (segmentWidth > 0) {
      indicatorX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 20,
        stiffness: 260,
        mass: 0.8,
      });
    }
  }, [selectedIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: segmentWidth,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const innerWidth = event.nativeEvent.layout.width - 8;
    setSegmentWidth(innerWidth / MODES.length);
  };

  return (
    <View
      className="rounded-2xl p-1 mx-5 mb-3 overflow-hidden"
      style={getPastelSurfaceStyle(theme, { borderRadius: 20 })}
      onLayout={handleLayout}
    >
      {segmentWidth > 0 && (
        <Animated.View
          className="absolute top-1 bottom-1 left-1 rounded-xl"
          style={[
            indicatorStyle,
            { backgroundColor: theme.activeColorIcon },
          ]}
        />
      )}

      <View className="flex-row">
        {MODES.map((mode) => {
          const selected = value === mode.key;
          return (
            <Pressable
              key={mode.key}
              onPress={() => onChange(mode.key)}
              className="flex-1 py-2.5 rounded-xl items-center z-10"
            >
              <Text
                className="font-pixel text-sm"
                style={{
                  color: selected ? theme.white : theme.defaultTextColor,
                }}
              >
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
