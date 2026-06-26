import { darkTheme, lightTheme } from "@/components/colors";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import React from "react";
import { Text, View } from "react-native";
import { useSettings } from "../context/SettingsContext";
import "../global.css";

export default function Calendar() {
  const { settings } = useSettings();
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopStatusBarGuard />
      <View className="flex-1 items-center justify-center px-5">
        <Text
          className="font-pixel text-xl"
          style={{ color: theme.defaultTextColor }}
        >
          Calendrier
        </Text>
      </View>
    </View>
  );
}
