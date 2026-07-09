import { Course } from "@/app/context/CoursesContext";
import { PlannedStudySession } from "@/app/context/PlannedStudyContext";
import { PomodoroStudyRecord } from "@/app/context/PomodoroStudyContext";
import {
  differenceInMinutes,
  endOfWeek,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";

export interface CourseWeeklyProgress {
  goalHours: number;
  actualHours: number;
  plannedHours: number;
  progress: number;
}

export interface StudyHoursSnapshot {
  records: PomodoroStudyRecord[];
  plannedSessions: PlannedStudySession[];
}

function startOfWeekMonday(now: Date) {
  return startOfWeek(now, { weekStartsOn: 1 });
}

function endOfWeekMonday(now: Date) {
  return endOfWeek(now, { weekStartsOn: 1 });
}

function isWithinWeek(date: Date, weekStart: Date, weekEnd: Date) {
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

function sumMinutesInWeek(records: PomodoroStudyRecord[], now: Date): number {
  const weekStart = startOfWeekMonday(now);
  const weekEnd = endOfWeekMonday(now);

  return records.reduce((total, record) => {
    const endedAt = parseISO(record.endedAt);
    if (!isWithinWeek(endedAt, weekStart, weekEnd)) return total;
    return total + record.studyMinutes;
  }, 0);
}

export function buildCourseWeeklyProgress(
  course: Course,
  snapshot: StudyHoursSnapshot,
  now: Date = new Date(),
): CourseWeeklyProgress {
  const actualHours = getCourseActualHoursThisWeek(course.id, snapshot.records, now);
  const plannedHours = getCoursePlannedHoursThisWeek(
    course.id,
    snapshot.plannedSessions,
    now,
  );
  const goalHours = course.weeklyHoursGoal;
  const progress =
    goalHours > 0
      ? Math.min(actualHours / goalHours, 1)
      : actualHours > 0
        ? 1
        : 0;

  return { goalHours, actualHours, plannedHours, progress };
}

export function getCourseActualHoursThisWeek(
  courseId: string,
  records: PomodoroStudyRecord[],
  now: Date = new Date(),
): number {
  return sumMinutesInWeek(
    records.filter((record) => record.courseId === courseId),
    now,
  ) / 60;
}

export function getCoursePlannedHoursThisWeek(
  courseId: string,
  plannedSessions: PlannedStudySession[],
  now: Date = new Date(),
): number {
  const weekStart = startOfWeekMonday(now);
  const weekEnd = endOfWeekMonday(now);
  let totalMinutes = 0;

  for (const session of plannedSessions) {
    if (session.courseId !== courseId) continue;

    const start = parseISO(session.startDateTime);
    if (!isWithinWeek(start, weekStart, weekEnd)) continue;

    const end = parseISO(session.endDateTime);
    totalMinutes += Math.max(0, differenceInMinutes(end, start));
  }

  return totalMinutes / 60;
}

export function getWeeklyStudyMinutes(
  records: PomodoroStudyRecord[],
  now: Date = new Date(),
): number {
  return sumMinutesInWeek(records, now);
}

export function getContributionsByDate(
  records: PomodoroStudyRecord[],
): Record<string, number> {
  const data: Record<string, number> = {};

  for (const record of records) {
    const dateKey = record.endedAt.split("T")[0];
    data[dateKey] = (data[dateKey] ?? 0) + 1;
  }

  return data;
}

export function getLastStudyDate(records: PomodoroStudyRecord[]): string | null {
  if (records.length === 0) return null;

  const sorted = [...records].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );

  return sorted[0].endedAt.split("T")[0];
}

export function getRecordsInDateRange(
  records: PomodoroStudyRecord[],
  startDate: Date,
  endDate: Date,
): PomodoroStudyRecord[] {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  return records.filter((record) => {
    const endedAt = new Date(record.endedAt).getTime();
    return endedAt >= startMs && endedAt <= endMs;
  });
}
