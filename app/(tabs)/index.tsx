import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useGPA } from "@/app/hooks/useGPA";
import { useSettings } from "../context/SettingsContext";
import ContributionTracker from "../../components/ContributionTracker";
import { WalkingBirdPeek } from "../../components/home/SpritePeeks";
import { useSessions } from "../context/SessionsContext";
import "../global.css";
import LastStreakTracker from "@/components/LastStreakTracker";
import WeekStreakTracker from "@/components/WeekStreakTracker";
import {darkTheme, lightTheme} from "@/components/colors";

export default function Accueil() {
  const router = useRouter();
  const { calculateOverallStats } = useGPA();
  const { activeSession } = useSessions();
  const [showGlobalGPA, setShowGlobalGPA] = useState(false);

  /* Récupère les paramètres pour savoir quelles données afficher */
  const {settings} = useSettings();

  // Calculate stats based on toggle
  const overallStats = calculateOverallStats(showGlobalGPA);

  /* Appliquer la couleur du theme */
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  return (
    <ScrollView className="flex-1 px-5 pt-16" style={{backgroundColor:theme.background}}>

      <View style={{ position: "relative", overflow: "visible" }} className="mb-3">
        <ContributionTracker />
        <WalkingBirdPeek displayHeight={82} overlap={44} right={2} />
      </View>

        {/* Série actuelle */}
        {settings.showStreak && (
            <View style={{ position: "relative", overflow: "visible" }} className="mb-3">
                <LastStreakTracker />
            </View>)}
        {/* Temps de la série de la semaine */}
        {settings.showStudyTime && (
            <View style={{ position: "relative", overflow: "visible" }} className="mb-3">
                <WeekStreakTracker />
            </View>)}
      {/* --- GPA Section --- */}
      <View className="rounded-2xl p-4 mb-3" style={{backgroundColor: theme.mainWrapperBgColor}}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-neutral-600 font-pixel text-lg">
            {showGlobalGPA
              ? "GPA Global"
              : activeSession
                ? `GPA ${activeSession.name}`
                : "GPA Global"}{" "}
            :
          </Text>
          <Pressable
            onPress={() => setShowGlobalGPA(!showGlobalGPA)}
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50"
            style={{backgroundColor:theme.background}}
          >
            <Ionicons
              name={showGlobalGPA ? "calendar" : "globe"}
              size={16}
              style={{color:theme.calendarIconColor}}
            />
            <Text className="text-base font-medium text-purple-100 font-pixel" style={{color:theme.defaultTextColor}}>
              {showGlobalGPA ? "Session" : "Global"}
            </Text>
          </Pressable>
        </View>
        {overallStats ? (
          <>
            <Text className="text-3xl font-semibold text-purple-200 font-pixel">
              {overallStats.gpaDisplay}
            </Text>
              {settings.showCourseCount && (
                  <Text className="text-sm text-neutral-500 mt-1 font-pixel">
                      {overallStats.courseCount} cours • {overallStats.totalCredits}{" "}
                      crédits
                  </Text>
              )}
          </>
        ) : (
          <View className="py-2">
            <Text className="text-xl text-neutral-500 italic font-pixel">
              Aucune note disponible pour le moment
            </Text>
            <Text className="text-base text-neutral-400 mt-1 font-pixel ">
              Ajoutez des notes à vos cours pour voir votre GPA
            </Text>
          </View>
        )}
      </View>

      {/* --- Actions --- */}
      <Pressable
        onPress={() => router.push("/(tabs)/pomodoro")}
        className="mt-5 rounded-2xl  py-4"
        style={{backgroundColor:theme.buttonColor}}
      >
        <Text className=" text-center font-semibold font-pixel text-xl" style={{color:theme.defaultTextColor}}>
          Démarrer un Pomodoro
        </Text>
      </Pressable>

      <Link href="/(tabs)/donnees" asChild>
        <Pressable className="mt-3 rounded-2xl border border-violet-100 py-4" style={{borderColor:theme.anotherborderColor}} >
          <Text className=" text-center font-medium font-pixel text-xl" style={{color:theme.anotherTextColor}}>Voir mes données</Text>
        </Pressable>
      </Link>

      <View className="h-10" />
    </ScrollView>
  );
}
