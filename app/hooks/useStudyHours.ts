import { usePlannedStudy } from "@/app/context/PlannedStudyContext";
import { usePomodoroStudy } from "@/app/context/PomodoroStudyContext";
import { useMemo } from "react";
import {
    calculateStudyMinutes,
    buildCourseWeeklyProgress,
    getContributionsByDate,
    getCourseActualHoursThisWeek,
    getCoursePlannedHoursThisWeek,
    getLastStudyDate,
    getRecordsInDateRange,
    getPlannedSessionsCountByDate,
    getPlannedSessionsCountForWeek,
    getWeeklyStudyMinutes,
    getWeeklyStudy,
    getDailyStudyMinutes,
    getDailyStudy,
    StudyHoursSnapshot,
} from "@/services/studyHours/StudyHoursFacade";
import { Course } from "@/app/context/CoursesContext";

export function useStudyHours() {
  const { records } = usePomodoroStudy();
  const { plannedSessions } = usePlannedStudy();

  const snapshot: StudyHoursSnapshot = useMemo(
    () => ({ records, plannedSessions }),
    [plannedSessions, records],
  );

  return useMemo(
    () => ({
      records,
      plannedSessions,
      snapshot,
        calculateStudyMinutes : (startedAt : string, endedAt: string) =>
            calculateStudyMinutes(startedAt, endedAt),
      getCourseActualHoursThisWeek: (courseId: string, now?: Date) =>
        getCourseActualHoursThisWeek(courseId, records, now),
      getCoursePlannedHoursThisWeek: (courseId: string, now?: Date) =>
        getCoursePlannedHoursThisWeek(courseId, plannedSessions, now),
      getCourseWeeklyProgress: (course: Course, now?: Date) =>
        buildCourseWeeklyProgress(course, snapshot, now),

      getWeeklyStudyMinutes: (now?: Date) => getWeeklyStudyMinutes(records, now),
      getWeeklyStudy: (now?: Date) => getWeeklyStudy(records, now),

      getDailyStudyMinutes: (now?: Date) => getDailyStudyMinutes(records, now),
      getDailyStudy: (now?: Date) => getDailyStudy(records, now),
      getContributionsByDate: () => getContributionsByDate(records),
      getPlannedSessionsCountByDate: (targetDate: Date) => getPlannedSessionsCountByDate(plannedSessions, targetDate),
      getPlannedSessionsForWeek: (targetDate: Date) => getPlannedSessionsCountForWeek(plannedSessions, targetDate),
      getLastStudyDate: () => getLastStudyDate(records),
      getRecordsInDateRange: (startDate: Date, endDate: Date) =>
        getRecordsInDateRange(records, startDate, endDate),
    }),
    [plannedSessions, records, snapshot],
  );
}
