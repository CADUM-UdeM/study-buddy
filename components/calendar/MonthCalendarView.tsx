import { PlannedStudySession } from "@/app/context/PlannedStudyContext";
import { lightTheme } from "@/components/colors";
import {
  getStudySessionColor,
  shadePastelColor,
  withPastelAlpha,
} from "@/components/courses/courseColors";
import { IdleFloat } from "@/components/home/IdleFloat";
import {
  getPastelChipStyle,
  getPastelSurfaceStyle,
} from "@/components/home/pastelStyles";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface MonthCalendarViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  plannedSessions: PlannedStudySession[];
  courseColorMap: Map<string, string>;
  onDayPress: (date: Date) => void;
  theme: typeof lightTheme;
}

function groupSessionsByDate(sessions: PlannedStudySession[]) {
  const map: Record<string, PlannedStudySession[]> = {};
  sessions.forEach((session) => {
    const dateKey = session.startDateTime.split("T")[0];
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(session);
  });
  return map;
}

export function MonthCalendarView({
  currentMonth,
  onMonthChange,
  plannedSessions,
  courseColorMap,
  onDayPress,
  theme,
}: MonthCalendarViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const sessionsByDate = useMemo(
    () => groupSessionsByDate(plannedSessions),
    [plannedSessions],
  );

  const cardStyle = getPastelSurfaceStyle(theme, { borderRadius: 20 });

  return (
    <View className="flex-1 px-5">
      <View className="rounded-2xl p-4 flex-1" style={cardStyle}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl"
            style={getPastelChipStyle(theme)}
          >
            <ChevronLeft size={20} color={theme.defaultTextColor} strokeWidth={2} />
          </Pressable>

          <Text
            className="font-pixel text-lg capitalize"
            style={{ color: theme.defaultTextColor }}
          >
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </Text>

          <Pressable
            onPress={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl"
            style={getPastelChipStyle(theme)}
          >
            <ChevronRight size={20} color={theme.defaultTextColor} strokeWidth={2} />
          </Pressable>
        </View>

        <View className="flex-row mb-2 w-full">
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} className="flex-1 items-center">
              <Text
                className="font-pixel text-xs"
                style={{ color: theme.gray }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDate[dateKey] ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const hasSessions = daySessions.length > 0;

            const sessionColors = daySessions.map((session) =>
              getStudySessionColor(courseColorMap, session.courseId, theme),
            );
            const primaryColor = sessionColors[0];
            const uniqueColors = [...new Set(sessionColors)];

            const dayCell = (
              <View
                className="w-9 min-h-[36px] rounded-xl items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: hasSessions
                    ? withPastelAlpha(
                        primaryColor,
                        inMonth ? theme.courseTintStrong : theme.courseTintMuted,
                      )
                    : today
                      ? theme.contentWrapperBgColor
                      : "transparent",
                  borderWidth: hasSessions ? 1.5 : today ? 2 : 0,
                  borderColor: hasSessions
                    ? shadePastelColor(primaryColor, 0.15)
                    : today
                      ? theme.activeColorIcon
                      : "transparent",
                  opacity: inMonth ? 1 : 0.4,
                }}
              >
                <Text
                  className="font-pixel text-sm"
                  style={{
                    color: hasSessions
                      ? theme.courseInk
                      : theme.defaultTextColor,
                  }}
                >
                  {format(day, "d")}
                </Text>

                {hasSessions && uniqueColors.length > 0 && (
                  <View
                    className="flex-row gap-0.5 mt-0.5 px-1"
                    style={{ maxWidth: 34, flexWrap: "wrap", justifyContent: "center" }}
                  >
                    {uniqueColors.slice(0, 4).map((color) => (
                      <View
                        key={color}
                        style={{
                          width: uniqueColors.length === 1 ? 14 : 5,
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: shadePastelColor(color, 0.12),
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            );

            return (
              <Pressable
                key={dateKey}
                onPress={() => onDayPress(day)}
                className="items-center justify-center py-1.5"
                style={{ width: `${100 / 7}%` }}
              >
                {hasSessions ? (
                  <IdleFloat seed={dateKey}>{dayCell}</IdleFloat>
                ) : (
                  dayCell
                )}
                {hasSessions && (
                  <Text
                    className="font-pixel text-[9px] mt-0.5"
                    style={{ color: theme.gray }}
                  >
                    {daySessions.length} séance{daySessions.length > 1 ? "s" : ""}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View
          className="mt-auto pt-4 rounded-xl px-3 py-2"
          style={getPastelChipStyle(theme)}
        >
          <Text className="font-pixel text-xs" style={{ color: theme.gray }}>
            Touchez un jour pour voir le détail et planifier vos séances.
          </Text>
        </View>
      </View>
    </View>
  );
}

/** @deprecated Use grouped sessions in MonthCalendarView instead. */
export function buildSessionsByDate(
  sessions: { startDateTime: string }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  sessions.forEach((session) => {
    const dateKey = session.startDateTime.split("T")[0];
    counts[dateKey] = (counts[dateKey] ?? 0) + 1;
  });
  return counts;
}
