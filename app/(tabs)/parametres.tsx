import { darkTheme, lightTheme } from "@/components/colors";
import React, { useRef } from "react";
import { Animated, Pressable, Switch, Text, View } from "react-native";
import { GradeBoundariesEditor } from "../../components/GradeBoundariesEditor";
import { TopStatusBarGuard } from "../../components/TopStatusBarGuard";
import { ChibiBirdPeek } from "../../components/home/SpritePeeks";
import { ThemeMode, useSettings } from "../context/SettingsContext";
import "../global.css";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARD_BORDER = "#444462";

const ACCENT = "#AB8BFF";
const SWITCH_TRACK_OFF = "#2D2A45";
const APPEARANCE_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: "Système", value: "system" },
  { label: "Clair", value: "light" },
  { label: "Sombre", value: "dark" },
];

const Parametres = () => {
  const {
    settings,
    updateSettings,
    updateGradeBoundaries,
    resetGradeBoundariesToDefault,
  } = useSettings();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleToggleSetting = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleGPAFormatChange = (format: "4.0" | "4.3" | "percentage") => {
    updateSettings({ gpaFormat: format });
  };

  /* Appliquer la couleur du theme */
  const theme = settings.isDarkMode ? darkTheme : lightTheme;
  const ROW_BG = theme.contentWrapperBgColor;

  const cardShellStyle = {
    backgroundColor: theme.mainWrapperBgColor,
    borderWidth: 1,
    borderColor: theme.borderColor,
  };
  const guardOpacity = scrollY.interpolate({
    inputRange: [0, 4, 16],
    outputRange: [0, 0.4, 1],
    extrapolate: "clamp",
  });
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
    <Animated.ScrollView
      className="flex-1 px-5 pt-20"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollIndicatorInsets={{ top: insets.top + 8 }}
      scrollEventThrottle={16}
      style={{ backgroundColor: theme.background,
        marginTop:20
       }}
    >
      <Text
        className="text-2xl text-purple-100 font-pixel mb-4"
        style={{ color: theme.defaultTextColor }}
      >
        Paramètres
      </Text>

      {/* --- GPA Format Section --- */}
      <View
        style={{ position: "relative", overflow: "visible" }}
        className="mb-3"
      >
        <View className="rounded-2xl p-4 gap-3" style={cardShellStyle}>
          <Text
            className="text-lg font-pixel text-neutral-600"
            style={{ color: theme.calendarLevelFour }}
          >
            Format GPA
          </Text>

          {["4.3", "4.0", "percentage"].map((format) => {
            const selected = settings.gpaFormat === format;
            return (
              <Pressable
                key={format}
                onPress={() =>
                  handleGPAFormatChange(format as "4.0" | "4.3" | "percentage")
                }
                className="flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: ROW_BG }}
              >
                <Text
                  className={`flex-1 font-pixel text-base `}
                  style={
                    selected
                      ? { color: theme.activeTextColor }
                      : { color: theme.defaultTextColor }
                  }
                >
                  {format === "percentage"
                    ? "Pourcentage (%)"
                    : `Format ${format}`}
                </Text>
                <View
                  className="w-5 h-5 rounded-full border-2"
                  style={{
                    borderColor: selected
                      ? theme.defaultTextColor
                      : theme.defaultTextColor,
                    backgroundColor: selected
                      ? theme.activeTextColor
                      : "transparent",
                  }}
                />
              </Pressable>
            );
          })}
        </View>
        <ChibiBirdPeek displayHeight={74} overlap={38} right={4} />
      </View>

      {/* --- Display Options Section --- */}
      <View className="rounded-2xl p-4 mb-3 gap-3" style={cardShellStyle}>
        <Text
          className="text-lg font-pixel text-neutral-600"
          style={{ color: theme.calendarLevelFour }}
        >
          Affichage de la page d&apos;accueil
        </Text>

        {[
          {
            key: "showStudyTime" as const,
            label: "Temps d'étude cette semaine",
          },
          { key: "showStreak" as const, label: "Série actuelle" },
          { key: "showAverage" as const, label: "Moyenne actuelle" },
          { key: "showGPA" as const, label: "GPA Global" },
          { key: "showCourseCount" as const, label: "Nombre de cours" },
        ].map(({ key, label }) => (
          <View
            key={key}
            className="flex-row items-center justify-between rounded-xl px-3 py-2"
            style={{ backgroundColor: ROW_BG }}
          >
            <Text
              className=" font-pixel text-base flex-1 pr-2"
              style={{ color: theme.defaultTextColor }}
            >
              {label}
            </Text>
            <Switch
              value={settings[key]}
              onValueChange={(value) => handleToggleSetting(key, value)}
              trackColor={{ false: SWITCH_TRACK_OFF, true: ACCENT }}
              thumbColor={settings[key] ? "#ffffff" : "#6B7280"}
            />
          </View>
        ))}
      </View>

      {/* --- Grade Boundaries Section --- */}
      <GradeBoundariesEditor
        boundaries={settings.gradeBoundaries}
        onUpdate={updateGradeBoundaries}
        onReset={resetGradeBoundariesToDefault}
        title="Seuils de notation"
      />

      {/* --- Theme Section --- */}
      <View className="rounded-2xl p-4 mb-3 gap-3" style={cardShellStyle}>
        <Text
          className="text-lg font-pixel text-neutral-600"
          style={{ color: theme.calendarLevelFour }}
        >
          Apparence
        </Text>

        {APPEARANCE_OPTIONS.map((option) => {
          const selected = settings.themeMode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => updateSettings({ themeMode: option.value })}
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{ backgroundColor: ROW_BG }}
            >
              <Text
                className="flex-1 font-pixel text-base"
                style={{
                  color: selected
                    ? theme.activeTextColor
                    : theme.defaultTextColor,
                }}
              >
                {option.label}
              </Text>
              <View
                className="w-5 h-5 rounded-full border-2"
                style={{
                  borderColor: selected
                    ? theme.defaultTextColor
                    : theme.defaultTextColor,
                  backgroundColor: selected
                    ? theme.activeTextColor
                    : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* --- Info Section --- */}
      <View className="rounded-2xl px-4 py-4 mb-8" style={cardShellStyle}>
        <Text
          className="text-neutral-500 text-sm text-center font-pixel"
          style={{ color: theme.gray }}
        >
          Vos préférences sont sauvegardées automatiquement.
        </Text>
      </View>

      <View className="h-10" />
    </Animated.ScrollView>
    <TopStatusBarGuard backgroundColor={theme.background} opacity={guardOpacity} />
    </View>
  );
};

export default Parametres;
