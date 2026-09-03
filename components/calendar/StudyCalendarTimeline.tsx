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
import {format} from "date-fns";
import React, { useCallback, useMemo, useRef } from "react";
import {Text, View} from "react-native";
import {useStudyHours} from "@/app/hooks/useStudyHours";

import StudyInfoCalendar from "@/components/calendar/StudyInfoCalendar";
import {PomodoroStudyRecord, usePomodoroStudy} from "@/app/context/PomodoroStudyContext";
import {calculateStudyMinutes} from "@/services/studyHours/StudyHoursFacade";

interface StudyCalendarTimelineProps {
  viewMode: "day" | "week";
  selectedDate?: string;
  onDateChanged?: (date: string) => void;
  onSessionCreated?: (session: PlannedStudySession | PomodoroStudyRecord) => void;
  onSessionPress?: (session: PlannedStudySession | PomodoroStudyRecord) => void;
  theme: typeof lightTheme;
}

export const useSessionMap = (plannedSessions: PlannedStudySession[]) => {
    return useMemo(() => {
        const map = new Map<string, PlannedStudySession>();
        plannedSessions.forEach((session) => map.set(session.id, session));
        return map;
    }, [plannedSessions]);
};

export const useRecordMap = (records: PomodoroStudyRecord[]) => {
    return useMemo(() => {
        const map = new Map<string, PomodoroStudyRecord>();
        records.forEach((focus) => map.set(focus.id, focus));
        return map;
    }, [records]);
};

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
    const {addRecord, updateRecord } = usePomodoroStudy();
    const {records} = usePomodoroStudy();
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

  const sessionById = useSessionMap(plannedSessions);
  const pomodoroById = useRecordMap(records);
  const [isSessionView, setIsSessionView] = React.useState(true);

  const handleDragCreateEnd = useCallback(
    (event: OnCreateEventResponse) => {
      if (!onSessionCreated) return;

      if(isSessionView){
          const created = addPlannedSession({
              startDateTime: event.start.dateTime!,
              endDateTime: event.end.dateTime!,
          });
          onSessionCreated(created);
      }
      else {
          const created = addRecord({
              courseId: "",
              studyMinutes: calculateStudyMinutes(event.start.dateTime!,event.end.dateTime!),
              startedAt: event.start.dateTime!,
              endedAt: event.end.dateTime!,
              completed: true,
          });
          onSessionCreated(created);
      }
    },
    [addPlannedSession, addRecord, isSessionView, onSessionCreated],
  );

  const handleDragEventEnd = useCallback(
    async (event: OnEventResponse) => {
      if (isSessionView){  
      updatePlannedSession(event.id, {
        startDateTime: event.start.dateTime!,
        endDateTime: event.end.dateTime!,
      });
      }
      else {
          updateRecord(event.id, {
              startedAt : event.start.dateTime!,
              endedAt : event.end.dateTime!,
          })   
      }
    },
    [isSessionView, updatePlannedSession, updateRecord],
  );
  const handlePressEvent = useCallback(
    (event: OnEventResponse) => {
      if (!onSessionPress) return;
      const getEvent = sessionById.get(event.id) ?? pomodoroById.get(event.id);
      if (getEvent) {
        onSessionPress(getEvent);
      }
    },
    [pomodoroById, sessionById, onSessionPress],
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

  const { getDailyStudy, getWeeklyStudy } = useStudyHours();
  const [calendarSize, setCalendarSize] = React.useState(60);
  const actualDate = new Date(`${selectedDate}T00:00:00`);


  const selectedRecords = isDayView ? getDailyStudy(actualDate) : getWeeklyStudy(actualDate);

  const recordsWithCourses = selectedRecords.map(r => ({
        id : r.id,
        title: courses.find(c => c.id === r.courseId)?.name,
        start: {dateTime : r.startedAt},
        end : {dateTime : r.endedAt},
        color: getStudySessionColor(courseColorMap, r.courseId, theme),
        courseId : courses.find(c => c.id === r.courseId)?.id
    }));

  const displayedEvents = isSessionView ? events : recordsWithCourses



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

      <StudyInfoCalendar isDayView={isDayView}
                         isSessionView={isSessionView} setIsSessionView={setIsSessionView}
                         calendarSize={calendarSize} setCalendarSize={setCalendarSize}
                         actualDate={actualDate} theme={theme}/>

      <View style={{ flex: 1 }}>
        <CalendarContainer
          ref={calendarRef}
          events={displayedEvents as EventItem[]}
          numberOfDays={numberOfDays}
          firstDay={1}
          locale="fr"
          initialLocales={CALENDAR_LOCALES}
          theme={calendarTheme}
          initialDate={selectedDate}
          onDateChanged={onDateChanged}
          start={STUDY_HOURS.start}
          end={STUDY_HOURS.end}
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
          allowPinchToZoom={true}
          timeInterval={calendarSize}
          initialTimeIntervalHeight={80}
          minTimeIntervalHeight={30}
          maxTimeIntervalHeight={300}
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
