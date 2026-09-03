import { darkTheme, lightTheme } from "@/components/colors";
import {getPastelChipStyle, getPastelSurfaceStyle} from "@/components/home/pastelStyles";
import React, { useRef } from "react";
import { Animated, Pressable, Switch, Text, View } from "react-native";
import { GradeBoundariesEditor } from "@/components/GradeBoundariesEditor";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import { ThemeMode, useSettings } from "../context/SettingsContext";
import "../global.css";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {Sun, Moon, Smartphone, LucideProps} from "lucide-react-native";


const ACCENT = "#AB8BFF";
const SWITCH_TRACK_OFF = "#2D2A45";
const APPEARANCE_OPTIONS: { label: string; value: ThemeMode, icon:React.FC<LucideProps> }[] = [
  { label: "Clair", value: "light", icon: Sun },
  { label: "Sombre", value: "dark", icon: Moon},
  { label: "Système", value: "system", icon : Smartphone },
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

  const handleGPAFormatChange = (format: "4.0" | "4.3" | "%") => {
    updateSettings({ gpaFormat: format });
  };

  /* Appliquer la couleur du theme */
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  const cardShellStyle = getPastelSurfaceStyle(theme);
  const getChipStyle = (
      theme :typeof lightTheme, selected : boolean) => [
        getPastelChipStyle(theme),
        {   borderWidth: selected ? 2 : 1,
            borderColor: selected ? theme.activeTextColor : theme.cardBorderSoft,
            backgroundColor: selected ? theme.cardGlow : theme.background,
        },];
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
      <View className="rounded-2xl p-4 gap-3 mb-3" style={cardShellStyle}>
          <Text
            className="text-lg font-pixel text-neutral-600"
            style={{ color: theme.calendarLevelFour }}
          >
            Format GPA
          </Text>

          <View className="flex-row gap-3">
          {["4.3", "4.0", "%"].map((format) => {
            const selected = settings.gpaFormat === format;
            return (
              <Pressable
                key={format}
                onPress={() =>
                  handleGPAFormatChange(format as "4.0" | "4.3" | "%")
                }
                className="flex-1 items-center rounded-2xl px-4 py-2.5"
                style={getChipStyle(theme, selected)}
              >
                  <Text
                      className={`flex-1 font-pixel text-base `}
                      style={selected ? { color: theme.activeTextColor } : { color: theme.defaultTextColor }}
                  >
                      {format}
                  </Text>
                <Text
                  className={`flex-1 font-pixel text-xs `}
                  style={
                    selected
                      ? { color: theme.activeTextColor }
                      : { color: theme.defaultTextColor }
                  }
                >
                    {format === "%" ? "Exact" : format === "4.3" ? "Canadien" : `Américain`}
                </Text>
              </Pressable>
            );
          })}
          </View>
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
          { key: "showGPA" as const, label: "Données GPA" },
          { key: "showCourseCount" as const, label: "Nombre de cours" },
          { key: "showStreak" as const, label: "Progrès pomodoro" },
          { key: "showWeekCalendar" as const, label: "Calendrier hebdomadaire" },
        ].map(({ key, label }) => {
          const selected = settings[key];
          return (
          <Pressable
            key={key}
            onPress={() => handleToggleSetting(key, !selected)}
            className="flex-row items-center justify-between rounded-xl px-3 py-2"
            style={[getChipStyle(theme, selected), {borderWidth:1, backgroundColor:theme.background,
            }]}
          >
            <Text
              className=" font-pixel text-base flex-1 pr-2"
              style={{ color: selected ? theme.activeTextColor : theme.defaultTextColor }}
            >
              {label}
            </Text>
            <Switch
              value={selected}
              onValueChange={(value) => handleToggleSetting(key, value)}
              trackColor={{ false: SWITCH_TRACK_OFF, true: ACCENT }}
              thumbColor={selected ? "#ffffff" : "#6B7280"}
            />
          </Pressable>
        )})}
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

        <View className="flex-row gap-3">
        {APPEARANCE_OPTIONS.map((option) => {
          const selected = settings.themeMode === option.value;
          const IconComponent = option.icon;
            return (
            <Pressable
              key={option.value}
              onPress={() => updateSettings({ themeMode: option.value })}
              className="flex-1 items-center rounded-2xl px-4 py-2.5"
              style={getChipStyle(theme,selected)}
            >
                <IconComponent color={selected
                    ? theme.activeTextColor
                    : theme.activeColorIcon} size={20}/>
                <Text
                className="mt-2 font-pixel text-xs"
                style={{
                  color: selected
                    ? theme.activeTextColor
                    : theme.defaultTextColor,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
        </View>
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
