import React from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import AppBackground from "../../components/AppBackground";
import { GradeBoundariesEditor } from "../../components/GradeBoundariesEditor";
import { useSettings } from "../context/SettingsContext";
import "../global.css";
import { colors } from "../theme/colors";

const Parametres = () => {
  const { settings, updateSettings, updateGradeBoundaries, resetGradeBoundariesToDefault } = useSettings();

  const handleToggleSetting = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleGPAFormatChange = (format: "4.0" | "4.3" | "percentage") => {
    updateSettings({ gpaFormat: format });
  };

  return (
    <AppBackground>
    <ScrollView className="flex-1 px-5 pt-16">
      <Text className="text-xl text-white font-bold mb-6 text-center">
        Paramètres
      </Text>

      {/* --- GPA Format Section --- */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-white mb-4">
          Format GPA
        </Text>

        {["4.3", "4.0", "percentage"].map((format) => (
          <View
            key={format}
            className="flex-row items-center mb-3 rounded-xl bg-theme-surface-elevated px-4 py-3"
          >
            <Text
              className={`flex-1 font-medium ${
                settings.gpaFormat === format ? "text-mauve" : "text-white"
              }`}
            >
              {format === "percentage" ? "Pourcentage (%)" : `Format ${format}`}
            </Text>
            <View
              className={`w-5 h-5 rounded-full border-2 ${
                settings.gpaFormat === format
                  ? "bg-royal-violet border-royal-violet"
                  : "border-indigo-ink"
              }`}
              onTouchEnd={() =>
                handleGPAFormatChange(format as "4.0" | "4.3" | "percentage")
              }
            />
          </View>
        ))}
      </View>

      {/* --- Display Options Section --- */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-white mb-4">
          Affichage de la page d'accueil
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
            className="flex-row items-center justify-between mb-3 rounded-xl bg-theme-surface-elevated px-4 py-3"
          >
            <Text className="text-white font-medium flex-1">{label}</Text>
            <Switch
              value={settings[key]}
              onValueChange={(value) => handleToggleSetting(key, value)}
              trackColor={{ false: colors.surfaceElevated, true: colors.accentLight }}
              thumbColor={settings[key] ? colors.primary : colors.surfaceElevated}
            />
          </View>
        ))}
      </View>

      {/* --- Grade Boundaries Section --- */}
      <GradeBoundariesEditor
        boundaries={settings.gradeBoundaries}
        onUpdate={updateGradeBoundaries}
        onReset={resetGradeBoundariesToDefault}
        title="Seuils de notation par défaut"
      />

      {/* --- Theme Section --- */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-white mb-4">Apparence</Text>

        <View className="flex-row items-center justify-between rounded-xl bg-theme-surface-elevated px-4 py-3">
          <Text className="text-white font-medium">Mode sombre</Text>
          <Switch
            value={settings.isDarkMode}
            onValueChange={(value) => handleToggleSetting("isDarkMode", value)}
            trackColor={{ false: colors.surfaceElevated, true: colors.accentLight }}
            thumbColor={settings.isDarkMode ? colors.primary : colors.surfaceElevated}
          />
        </View>
      </View>

      {/* --- Info Section --- */}
      <View className="rounded-xl bg-theme-surface-elevated px-4 py-4 mb-8">
        <Text className="text-mauve text-sm text-center opacity-80">
          Vos préférences sont sauvegardées automatiquement.
        </Text>
      </View>

      <View className="h-10" />
    </ScrollView>
    </AppBackground>
  );
};

export default Parametres;
