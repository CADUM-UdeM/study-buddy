import { useCourses } from "@/app/context/CoursesContext";
import {
  PlannedStudySession,
  usePlannedStudy,
} from "@/app/context/PlannedStudyContext";
import { lightTheme } from "@/components/colors";
import { getPastelChipStyle } from "@/components/home/pastelStyles";
import {
  buildCourseColorMap,
  getStudySessionColor,
} from "@/components/courses/courseColors";
import {
  buildCalendarTheme,
  CALENDAR_LOCALES,
  sessionToEvent,
  STUDY_HOURS,
  viewModeToDays,
} from "@/components/calendar/calendarTheme";
import { StudySessionEvent } from "@/components/calendar/StudySessionEvent";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  EventItem,
  OnCreateEventResponse,
  OnEventResponse,
  PackedEvent,
  SizeAnimation,
} from "@howljs/calendar-kit";
import { format } from "date-fns";
import React, { useCallback, useMemo, useRef } from "react";
import { Text, View } from "react-native";

interface StudyCalendarTimelineProps {
  viewMode: "day" | "week";
  selectedDate?: string;
  onDateChanged?: (date: string) => void;
  onSessionCreated?: (session: PlannedStudySession) => void;
  onSessionPress?: (session: PlannedStudySession) => void;
  theme: typeof lightTheme;
}

export function StudyCalendarTimeline({
  viewMode,
  selectedDate = format(new Date(), "yyyy-MM-dd"),
  onDateChanged,
  onSessionCreated,
  onSessionPress,
  theme,
}: StudyCalendarTimelineProps) {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { courses } = useCourses();
  const { plannedSessions, addPlannedSession, updatePlannedSession } =
    usePlannedStudy();

  const numberOfDays = viewModeToDays(viewMode);
  const isDayView = viewMode === "day";
  const calendarTheme = useMemo(() => buildCalendarTheme(theme), [theme]);

  const courseColorMap = useMemo(
    () => buildCourseColorMap(courses, theme),
    [courses, theme],
  );

  const courseNameById = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course) => map.set(course.id, course.name));
    return map;
  }, [courses]);

  const events = useMemo(
    () =>
      plannedSessions.map((session) =>
        sessionToEvent(
          session,
          getStudySessionColor(courseColorMap, session.courseId, theme),
          session.courseId
            ? courseNameById.get(session.courseId)
            : undefined,
        ),
      ),
    [plannedSessions, courseColorMap, courseNameById],
  );

  const sessionById = useMemo(() => {
    const map = new Map<string, PlannedStudySession>();
    plannedSessions.forEach((session) => map.set(session.id, session));
    return map;
  }, [plannedSessions]);

  const handleDragCreateEnd = useCallback(
    (event: OnCreateEventResponse) => {
      if (!onSessionCreated) return;

      const created = addPlannedSession({
        startDateTime: event.start.dateTime!,
        endDateTime: event.end.dateTime!,
      });
      onSessionCreated(created);
    },
    [addPlannedSession, onSessionCreated],
  );

  const handleDragEventEnd = useCallback(
    async (event: OnEventResponse) => {
      updatePlannedSession(event.id, {
        startDateTime: event.start.dateTime!,
        endDateTime: event.end.dateTime!,
      });
    },
    [updatePlannedSession],
  );

  const handlePressEvent = useCallback(
    (event: OnEventResponse) => {
      if (!onSessionPress) return;

      const session = sessionById.get(event.id);
      if (session) {
        onSessionPress(session);
      }
    },
    [sessionById, onSessionPress],
  );

  const renderEvent = useCallback(
    (event: PackedEvent, size: SizeAnimation) => {
      const session = sessionById.get(event.id);
      const courseName = session?.courseId
        ? courseNameById.get(session.courseId)
        : undefined;
      const courseColor = getStudySessionColor(
        courseColorMap,
        session?.courseId ?? event.courseId,
        theme,
      );

      return (
        <StudySessionEvent
          event={event}
          size={size}
          session={session}
          courseName={courseName}
          courseColor={courseColor}
          showTimes={isDayView}
          theme={theme}
        />
      );
    },
    [sessionById, courseNameById, courseColorMap, isDayView, theme],
  );

  return (
    <View className="flex-1">
      <View
        className="mx-5 mb-2 rounded-xl px-3 py-2"
        style={getPastelChipStyle(theme)}
      >
        <Text className="font-pixel text-xs" style={{ color: theme.gray }}>
          Glissez sur la grille pour planifier une séance d&apos;étude.
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <CalendarContainer
          ref={calendarRef}
          events={events as EventItem[]}
          numberOfDays={numberOfDays}
          firstDay={1}
          locale="fr"
          initialLocales={CALENDAR_LOCALES}
          theme={calendarTheme}
          initialDate={selectedDate}
          onDateChanged={onDateChanged}
          start={STUDY_HOURS.start}
          end={STUDY_HOURS.end}
          timeInterval={60}
          scrollToNow={false}
          useHaptic
          allowDragToCreate
          allowDragToEdit
          defaultDuration={60}
          dragStep={15}
          onDragCreateEventEnd={handleDragCreateEnd}
          onDragEventEnd={handleDragEventEnd}
          onPressEvent={handlePressEvent}
          useAllDayEvent={false}
        >
          <CalendarHeader />
          <CalendarBody
            hourFormat="HH:mm"
            showNowIndicator
            renderEvent={renderEvent}
          />
        </CalendarContainer>
      </View>
    </View>
  );
}
