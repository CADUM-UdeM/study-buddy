import {
  PlannedStudySession,
  usePlannedStudy,
} from "@/app/context/PlannedStudyContext";
import { darkTheme, lightTheme } from "@/components/colors";
import { CalendarViewMode } from "@/components/calendar/calendarTheme";
import { MonthCalendarView } from "@/components/calendar/MonthCalendarView";
import { StudyCalendarTimeline } from "@/components/calendar/StudyCalendarTimeline";
import { StudySessionModal } from "@/components/calendar/StudySessionModal";
import { ViewModeSwitcher } from "@/components/calendar/ViewModeSwitcher";
import { buildCourseColorMap } from "@/components/courses/courseColors";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import { useCourses } from "../context/CoursesContext";
import { format, parseISO } from "date-fns";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import "../global.css";

export default function Calendar() {
  const { settings } = useSettings();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const { plannedSessions, isLoading, updatePlannedSession, deletePlannedSession } =
    usePlannedStudy();
  const { courses } = useCourses();
  const insets = useSafeAreaInsets();

  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalSession, setModalSession] = useState<PlannedStudySession | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (view === "day" || view === "week" || view === "month") {
        setViewMode(view);
      }
    }, [view]),
  );

  const courseColorMap = useMemo(
    () => buildCourseColorMap(courses, theme),
    [courses, theme],
  );

  const openModal = (session: PlannedStudySession) => {
    setModalSession(session);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalSession(null);
  };

  const handleSaveSession = (data: {
    courseId?: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
  }) => {
    if (!modalSession) return;
    updatePlannedSession(modalSession.id, {
      courseId: data.courseId,
      description: data.description || undefined,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
    });
    closeModal();
  };

  const handleDeleteSession = () => {
    if (!modalSession) return;
    deletePlannedSession(modalSession.id);
    closeModal();
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setCurrentMonth(date);
    setViewMode("day");
  };

  const handleDateChanged = (date: string) => {
    setSelectedDate(date.split("T")[0]);
    setCurrentMonth(parseISO(date.split("T")[0]));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopStatusBarGuard backgroundColor={theme.background} />

      <View
        className="px-5 pb-2"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Text
          className="font-pixel text-2xl"
          style={{ color: theme.defaultTextColor }}
        >
          Calendrier
        </Text>
        <Text className="font-pixel text-sm mt-1" style={{ color: theme.gray }}>
          Planifiez vos séances d&apos;étude à l&apos;avance
        </Text>
      </View>

      <ViewModeSwitcher
        value={viewMode}
        onChange={setViewMode}
        theme={theme}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.activeColorIcon} />
        </View>
      ) : viewMode === "month" ? (
        <MonthCalendarView
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          plannedSessions={plannedSessions}
          courseColorMap={courseColorMap}
          onDayPress={handleDayPress}
          theme={theme}
        />
      ) : (
        <StudyCalendarTimeline
          key={`${viewMode}-${selectedDate}`}
          viewMode={viewMode}
          selectedDate={selectedDate}
          onDateChanged={handleDateChanged}
          onSessionCreated={openModal}
          onSessionPress={openModal}
          theme={theme}
        />
      )}

      <StudySessionModal
        visible={modalVisible}
        session={modalSession}
        onClose={closeModal}
        onSave={handleSaveSession}
        onDelete={modalSession ? handleDeleteSession : undefined}
        theme={theme}
      />
    </View>
  );
}
