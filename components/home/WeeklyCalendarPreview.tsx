import { usePlannedStudy } from "@/app/context/PlannedStudyContext";
import { useCourses } from "@/app/context/CoursesContext";
import { lightTheme } from "@/components/colors";
import {
  buildCourseColorMap,
  getStudySessionColor,
  shadePastelColor,
} from "@/components/courses/courseColors";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

const PREVIEW_START_MINUTES = 8 * 60;
const PREVIEW_END_MINUTES = 20 * 60;
const PREVIEW_RANGE = PREVIEW_END_MINUTES - PREVIEW_START_MINUTES;
const PREVIEW_HEIGHT = 72;

function toMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getBlockLayout(start: Date, end: Date) {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  const clampedStart = Math.max(PREVIEW_START_MINUTES, startMinutes);
  const clampedEnd = Math.min(PREVIEW_END_MINUTES, endMinutes);

  if (clampedEnd <= clampedStart) return null;

  return {
    top:
      ((clampedStart - PREVIEW_START_MINUTES) / PREVIEW_RANGE) * PREVIEW_HEIGHT,
    height: Math.max(
      5,
      ((clampedEnd - clampedStart) / PREVIEW_RANGE) * PREVIEW_HEIGHT,
    ),
  };
}

function getNowLineTop(now: Date) {
  const nowMinutes = toMinutes(now);
  if (
    nowMinutes < PREVIEW_START_MINUTES ||
    nowMinutes > PREVIEW_END_MINUTES
  ) {
    return null;
  }

  return (
    ((nowMinutes - PREVIEW_START_MINUTES) / PREVIEW_RANGE) * PREVIEW_HEIGHT
  );
}

interface WeeklyCalendarPreviewProps {
  theme: typeof lightTheme;
}

export function WeeklyCalendarPreview({ theme }: WeeklyCalendarPreviewProps) {
  const { plannedSessions } = usePlannedStudy();
  const { courses } = useCourses();
  const courseColorMap = useMemo(
    () => buildCourseColorMap(courses, theme),
    [courses, theme],
  );
  const today = new Date();
  const [gridWidth, setGridWidth] = useState(0);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, []);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, typeof plannedSessions>();

    weekDays.forEach((day) => {
      map.set(format(day, "yyyy-MM-dd"), []);
    });

    plannedSessions.forEach((session) => {
      const key = format(parseISO(session.startDateTime), "yyyy-MM-dd");
      if (map.has(key)) {
        map.get(key)!.push(session);
      }
    });

    return map;
  }, [plannedSessions, weekDays]);

  const nowLineTop = getNowLineTop(today);
  const todayInWeek = weekDays.some((day) => isSameDay(day, today));

  return (
    <View>
      <View className="flex-row mb-2">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <View key={format(day, "yyyy-MM-dd")} className="flex-1 items-center">
              <Text
                className="font-pixel text-[10px] capitalize mb-1"
                style={{ color: isToday ? theme.activeTextColor : theme.gray }}
              >
                {format(day, "EEE", { locale: fr }).slice(0, 3)}
              </Text>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isToday
                    ? theme.activeColorIcon
                    : theme.contentWrapperBgColor,
                }}
              >
                <Text
                  className="font-pixel text-xs"
                  style={{
                    color: isToday ? theme.white : theme.defaultTextColor,
                  }}
                >
                  {format(day, "d")}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View
        className="rounded-xl overflow-hidden"
        style={{
          height: PREVIEW_HEIGHT,
          backgroundColor: theme.cardGlow,
        }}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
      >
        <View className="flex-row flex-1">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDay.get(dateKey) ?? [];

          return (
            <View
              key={`grid-${dateKey}`}
              className="flex-1 relative"
              style={{
                borderRightWidth: dateKey !== format(weekDays[6], "yyyy-MM-dd") ? 1 : 0,
                borderRightColor: theme.borderColor,
              }}
            >
              {daySessions.map((session) => {
                const layout = getBlockLayout(
                  parseISO(session.startDateTime),
                  parseISO(session.endDateTime),
                );
                if (!layout) return null;

                const blockColor = getStudySessionColor(
                  courseColorMap,
                  session.courseId,
                  theme,
                );

                return (
                  <View
                    key={session.id}
                    className="absolute left-1 right-1 rounded-md"
                    style={{
                      top: layout.top,
                      height: layout.height,
                      backgroundColor: blockColor,
                      borderLeftWidth: 2,
                      borderLeftColor: shadePastelColor(blockColor, 0.25),
                      opacity: 0.92,
                    }}
                  />
                );
              })}
            </View>
          );
        })}
        </View>

        {todayInWeek && nowLineTop !== null && gridWidth > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: PREVIEW_HEIGHT,
            }}
          >
            <Svg width={gridWidth} height={PREVIEW_HEIGHT}>
              <Line
                x1={8}
                y1={nowLineTop}
                x2={gridWidth - 8}
                y2={nowLineTop}
                stroke={theme.activeColorIcon}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
}
