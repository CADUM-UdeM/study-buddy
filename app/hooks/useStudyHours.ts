import { usePlannedStudy } from "@/app/context/PlannedStudyContext";
import { usePomodoroStudy } from "@/app/context/PomodoroStudyContext";
import { useMemo } from "react";
import {
  buildCourseWeeklyProgress,
  getContributionsByDate,
  getCourseActualHoursThisWeek,
  getCoursePlannedHoursThisWeek,
  getLastStudyDate,
  getRecordsInDateRange,
  getWeeklyStudyMinutes,
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
      getCourseActualHoursThisWeek: (courseId: string, now?: Date) =>
        getCourseActualHoursThisWeek(courseId, records, now),
      getCoursePlannedHoursThisWeek: (courseId: string, now?: Date) =>
        getCoursePlannedHoursThisWeek(courseId, plannedSessions, now),
      getCourseWeeklyProgress: (course: Course, now?: Date) =>
        buildCourseWeeklyProgress(course, snapshot, now),
      getWeeklyStudyMinutes: (now?: Date) => getWeeklyStudyMinutes(records, now),
      getContributionsByDate: () => getContributionsByDate(records),
      getLastStudyDate: () => getLastStudyDate(records),
      getRecordsInDateRange: (startDate: Date, endDate: Date) =>
        getRecordsInDateRange(records, startDate, endDate),
    }),
    [plannedSessions, records, snapshot],
  );
}
