import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useGPA } from "../../app/hooks/useGPA";
import AppBackground from "../../components/AppBackground";
import ContributionTracker from "../../components/ContributionTracker";
import { useSessions } from "../context/SessionsContext";
import "../global.css";
import { colors } from "../theme/colors";

export default function Accueil() {
  const router = useRouter();
  const { calculateOverallStats } = useGPA();
  const { activeSession } = useSessions();
  const [showGlobalGPA, setShowGlobalGPA] = useState(false);

  // Calculate stats based on toggle
  const overallStats = calculateOverallStats(showGlobalGPA);

  return (
    <AppBackground>
    <ScrollView className="flex-1 px-5 pt-16">
      <Text className="text-xl text-white font-bold mb-4 text-center">
        Bienvenue !
      </Text>

      <ContributionTracker />

      {/* --- GPA Section --- */}
      <View className="rounded-2xl bg-indigo-ink/50 border border-indigo-velvet p-4 mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-mauve opacity-90">
            {showGlobalGPA
              ? "GPA Global"
              : activeSession
                ? `GPA ${activeSession.name}`
                : "GPA Global"}{" "}
            :
          </Text>
          <Pressable
            onPress={() => setShowGlobalGPA(!showGlobalGPA)}
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-surface-elevated"
          >
            <Ionicons
              name={showGlobalGPA ? "globe" : "calendar"}
              size={16}
              color={colors.success}
            />
            <Text className="text-xs font-medium text-mauve">
              {showGlobalGPA ? "Global" : "Session"}
            </Text>
          </Pressable>
        </View>
        {overallStats ? (
          <>
            <Text className="text-2xl font-semibold text-theme-text-on-dark">
              {overallStats.gpaDisplay}
            </Text>
            <Text className="text-sm text-mauve opacity-80 mt-1">
              {overallStats.courseCount} cours • {overallStats.totalCredits}{" "}
              crédits
            </Text>
          </>
        ) : (
          <View className="py-2">
            <Text className="text-base text-mauve opacity-80 italic">
              Aucune note disponible pour le moment
            </Text>
            <Text className="text-sm text-mauve opacity-70 mt-1">
              Ajoutez des notes à vos cours pour voir votre GPA
            </Text>
          </View>
        )}
      </View>

      {/* --- Actions --- */}
      <Pressable
        onPress={() => router.push("/(tabs)/pomodoro")}
        className="mt-5 rounded-2xl bg-royal-violet py-4"
      >
        <Text className="text-white text-center font-semibold">
          Démarrer un Pomodoro
        </Text>
      </Pressable>

      <Link href="/(tabs)/donnees" asChild>
        <Pressable className="mt-3 rounded-2xl border border-mauve py-4">
          <Text className="text-center font-medium text-theme-text-on-dark">Voir mes données</Text>
        </Pressable>
      </Link>

      <View className="h-10" />
    </ScrollView>
    </AppBackground>
  );
}
