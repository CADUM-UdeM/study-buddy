import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {useRef, useState} from "react";
import {Animated, Pressable, Text, View} from "react-native";
import { useGPA } from "@/app/hooks/useGPA";
import { useSettings } from "../context/SettingsContext";
import ContributionTracker from "../../components/ContributionTracker";
import { WalkingBirdInline } from "@/components/home/SpritePeeks";
import { getPastelChipStyle, PastelCard } from "../../components/home/PastelCard";
import { useSessions } from "../context/SessionsContext";
import "../global.css";
import SessionTracker from "@/components/SessionTracker";
import { WeeklyCalendarCard } from "@/components/home/WeeklyCalendarCard";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import { darkTheme, lightTheme } from "@/components/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MASCOT_SLOT_WIDTH = 92;

export default function Accueil() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { calculateOverallStats } = useGPA();
  const { activeSession } = useSessions();
  const [showGlobalGPA, setShowGlobalGPA] = useState(false);
  const insets = useSafeAreaInsets();

  const { settings } = useSettings();
  const overallStats = calculateOverallStats(showGlobalGPA);
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopStatusBarGuard backgroundColor={theme.background} />
        <Animated.ScrollView
            className="flex-1 px-5"
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true },
            )}
            scrollIndicatorInsets={{ top: insets.top + 8 }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 24,
            }}
        >
      <View
        style={{
          paddingBottom: 8
        }}
      >
          <View className="flex-row items-end mb-3" style={{ overflow: "visible" }}>
              {settings.showGPA && (
            <PastelCard
              theme={theme}
              animated
              animationDelay={0}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="font-pixel text-lg flex-1 pr-2"
                  style={{ color: theme.defaultTextColor }}
                  numberOfLines={1}
                >
                  {showGlobalGPA
                    ? "GPA Global"
                    : activeSession
                      ? `GPA ${activeSession.name}`
                      : "GPA Global"}{" "}
                  :
                </Text>
                <Pressable
                  onPress={() => setShowGlobalGPA(!showGlobalGPA)}
                  className="flex-row items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={getPastelChipStyle(theme)}
                >
                  <Ionicons
                    name={showGlobalGPA ? "calendar" : "globe"}
                    size={16}
                    style={{ color: theme.activeColorIcon }}
                  />
                  <Text
                    className="text-base font-medium font-pixel"
                    style={{ color: theme.activeTextColor }}
                  >
                    {showGlobalGPA ? "Session" : "Global"}
                  </Text>
                </Pressable>
              </View>

              {overallStats ? (
                <>
                  <Text
                    className="text-3xl font-semibold font-pixel"
                    style={{ color: theme.activeTextColor }}
                  >
                    {overallStats.gpaDisplay}
                  </Text>
                  {settings.showCourseCount && (
                    <Text
                      className="text-sm mt-1 font-pixel"
                      style={{ color: theme.gray }}
                    >
                      {overallStats.courseCount} cours • {overallStats.totalCredits}{" "}
                      crédits
                    </Text>
                  )}
                </>
              ) : (
                <View className="py-2">
                  <Text
                    className="text-lg font-pixel"
                    style={{ color: theme.gray }}
                  >
                    Aucune note disponible
                  </Text>
                  <Text
                    className="text-sm mt-1 font-pixel"
                    style={{ color: theme.gray }}
                  >
                    Ajoutez des notes pour voir votre GPA
                  </Text>
                </View>
              )}
            </PastelCard>
            )}
            <View
              style={{
                width: MASCOT_SLOT_WIDTH,
                marginLeft: 8,
                minHeight: 96,
                justifyContent: "flex-end",
              }}
            >
              <WalkingBirdInline displayHeight={78} />
            </View>
          </View>

          <PastelCard theme={theme} animated animationDelay={120} className="mb-3">
            <ContributionTracker embedded />
          </PastelCard>

          {settings.showStreak && (
            <PastelCard theme={theme} animated animationDelay={240} className="mb-3">
              <SessionTracker embedded />
            </PastelCard>
          )}

          {settings.showWeekCalendar && (
          <WeeklyCalendarCard theme={theme} animated animationDelay={360} />
          )}
          <PastelCard
            theme={theme}
            animated
            animationDelay={480}
            onPress={() => router.push("/(tabs)/pomodoro")}
            className="mt-5"
            contentStyle={{ paddingVertical: 18, paddingHorizontal: 16 }}
            style={{
              backgroundColor: theme.buttonColor,
              borderColor: theme.cardBorderSoft,
            }}
          >
            <Text
              className="text-center font-semibold font-pixel text-xl"
              style={{ color: theme.defaultTextColor }}
            >
              Démarrer un Pomodoro
            </Text>
          </PastelCard>
      </View>
        </Animated.ScrollView>
    </View>
  );
}
