import { lightTheme } from "@/components/colors";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const QUARTER_MINUTES = [0, 15, 30, 45];

const DEFAULT_SUGGESTIONS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "12:00",
  "12:30",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "16:00",
  "16:30",
  "18:00",
  "18:30",
  "20:00",
];

export function formatTimeWhileTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function completeTime(value: string, fallback = "09:00"): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return fallback;

  if (digits.length === 1) {
    return `0${digits}:00`;
  }

  if (digits.length === 2) {
    const hour = Math.min(23, parseInt(digits, 10));
    return `${hour.toString().padStart(2, "0")}:00`;
  }

  if (digits.length === 3) {
    const hour = Math.min(23, parseInt(digits.slice(0, 2), 10));
    const minuteTens = digits[2];
    return `${hour.toString().padStart(2, "0")}:${minuteTens}0`;
  }

  const hour = Math.min(23, parseInt(digits.slice(0, 2), 10));
  const minute = Math.min(59, parseInt(digits.slice(2, 4), 10));
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function snapToQuarterHour(value: string, fallback = "09:00"): string {
  const completed = completeTime(value, fallback);
  const parsed = parseTimeString(completed);
  if (!parsed) return fallback;

  const total = parsed.hours * 60 + parsed.minutes;
  const snapped = Math.min(23 * 60 + 45, Math.round(total / 15) * 15);
  const hours = Math.floor(snapped / 60);
  const minutes = snapped % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function parseTimeString(
  time: string,
): { hours: number; minutes: number } | null {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

export function applyTimeString(base: Date, time: string): Date | null {
  const parsed = parseTimeString(time);
  if (!parsed) return null;

  const result = new Date(base);
  result.setHours(parsed.hours, parsed.minutes, 0, 0);
  return result;
}

function quarterHoursForHour(hour: number): string[] {
  const h = hour.toString().padStart(2, "0");
  return QUARTER_MINUTES.map(
    (minute) => `${h}:${minute.toString().padStart(2, "0")}`,
  );
}

function getSuggestions(partial: string): string[] {
  const digits = partial.replace(/\D/g, "");

  if (digits.length === 0) {
    return DEFAULT_SUGGESTIONS;
  }

  const fromDefaults = DEFAULT_SUGGESTIONS.filter((time) =>
    time.replace(":", "").startsWith(digits),
  );
  if (fromDefaults.length > 0) {
    return fromDefaults.slice(0, 6);
  }

  const results: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const time of quarterHoursForHour(hour)) {
      if (time.replace(":", "").startsWith(digits)) {
        results.push(time);
      }
    }
  }

  return results.slice(0, 6);
}

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  theme: typeof lightTheme;
}

function SuggestionChip({
  time,
  index,
  onSelect,
  theme,
}: {
  time: string;
  index: number;
  onSelect: (time: string) => void;
  theme: typeof lightTheme;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(index * 35)}
      exiting={FadeOutUp.duration(140)}
      layout={LinearTransition.springify().damping(18).stiffness(220)}
    >
      <Pressable
        onPress={() => onSelect(time)}
        className="px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: theme.contentWrapperBgColor }}
      >
        <Text
          className="font-pixel text-sm"
          style={{ color: theme.activeTextColor }}
        >
          {time}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function TimeInput({
  label,
  value,
  onChange,
  onComplete,
  theme,
}: TimeInputProps) {
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const suggestions = useMemo(
    () => (focused ? getSuggestions(value) : []),
    [focused, value],
  );

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, focusProgress]);

  const inputShellStyle = useAnimatedStyle(() => ({
    borderWidth: 1 + focusProgress.value,
    borderColor: focusProgress.value > 0.5 ? theme.activeColorIcon : "transparent",
    transform: [{ scale: 1 + focusProgress.value * 0.02 }],
  }));

  const handleSelect = (time: string) => {
    onChange(time);
    onComplete(time);
  };

  return (
    <View className="gap-2">
      <Text className="font-pixel text-sm" style={{ color: theme.gray }}>
        {label}
      </Text>

      <Animated.View className="rounded-xl overflow-hidden" style={inputShellStyle}>
        <TextInput
          value={value}
          onChangeText={(text) => onChange(formatTimeWhileTyping(text))}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onComplete(snapToQuarterHour(value));
          }}
          placeholder="HH:mm"
          placeholderTextColor={theme.gray}
          keyboardType="number-pad"
          maxLength={5}
          className="px-4 py-3 font-pixel text-center"
          style={{
            backgroundColor: theme.contentWrapperBgColor,
            color: theme.defaultTextColor,
            fontFamily: "PixelJersey",
            fontSize: 18,
          }}
        />
      </Animated.View>

      {focused && suggestions.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          exiting={FadeOutUp.duration(160)}
          layout={LinearTransition.springify().damping(18).stiffness(220)}
          className="flex-row flex-wrap gap-2"
        >
          {suggestions.map((time, index) => (
            <SuggestionChip
              key={time}
              time={time}
              index={index}
              onSelect={handleSelect}
              theme={theme}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}
