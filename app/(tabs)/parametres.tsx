import React from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ChibiBirdPeek } from "../../components/home/SpritePeeks";
import { GradeBoundariesEditor } from "../../components/GradeBoundariesEditor";
import { useSettings } from "../context/SettingsContext";
import "../global.css";

const CARD_BG = "#1A1729";
const CARD_BORDER = "#444462";
const ROW_BG = "#444462";
const ACCENT = "#AB8BFF";
const SWITCH_TRACK_OFF = "#2D2A45";

const Parametres = () => {
  const { settings, updateSettings, updateGradeBoundaries, resetGradeBoundariesToDefault } = useSettings();

  const handleToggleSetting = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleGPAFormatChange = (format: "4.0" | "4.3" | "percentage") => {
    updateSettings({ gpaFormat: format });
  };

  const cardShellStyle = {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  };

  return (
    <ScrollView className="flex-1 bg-dark-primary px-5 pt-16">
      <Text className="text-2xl text-purple-100 font-pixel mb-4">
        Paramètres
      </Text>

      {/* --- GPA Format Section --- */}
      <View style={{ position: "relative", overflow: "visible" }} className="mb-3">
        <View className="rounded-2xl p-4 gap-3" style={cardShellStyle}>
          <Text className="text-lg font-pixel text-neutral-600">
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
                  className={`flex-1 font-pixel text-base ${selected ? "text-dark-accent font-semibold" : "text-purple-200"
                    }`}
                >
                  {format === "percentage" ? "Pourcentage (%)" : `Format ${format}`}
                </Text>
                <View
                  className="w-5 h-5 rounded-full border-2"
                  style={{
                    borderColor: selected ? ACCENT : CARD_BORDER,
                    backgroundColor: selected ? ACCENT : "transparent",
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
        <Text className="text-lg font-pixel text-neutral-600">
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
            <Text className="text-purple-100 font-pixel text-base flex-1 pr-2">
              {label}
            </Text>
            <Switch
              value={settings[key]}
              onValueChange={(value) => handleToggleSetting(key, value)}
              trackColor={{ false: SWITCH_TRACK_OFF, true: ACCENT }}
              thumbColor={settings[key] ? "#e0aaff" : "#6B7280"}
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
      <View className="rounded-2xl p-4 mb-3 gap-3" style={cardShellStyle}>
        <Text className="text-lg font-pixel text-neutral-600">Apparence</Text>

        <View
          className="flex-row items-center justify-between rounded-xl px-3 py-2"
          style={{ backgroundColor: ROW_BG }}
        >
          <Text className="text-purple-100 font-pixel text-base">Mode sombre</Text>
          <Switch
            value={settings.isDarkMode}
            onValueChange={(value) => handleToggleSetting("isDarkMode", value)}
            trackColor={{ false: SWITCH_TRACK_OFF, true: ACCENT }}
            thumbColor={settings.isDarkMode ? "#e0aaff" : "#6B7280"}
          />
        </View>
      </View>

      {/* --- Info Section --- */}
      <View
        className="rounded-2xl px-4 py-4 mb-8"
        style={cardShellStyle}
      >
        <Text className="text-neutral-500 text-sm text-center font-pixel">
          Vos préférences sont sauvegardées automatiquement.
        </Text>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
};

export default Parametres;
