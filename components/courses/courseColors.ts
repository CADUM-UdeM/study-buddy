import { Course } from "@/app/context/CoursesContext";
import { lightTheme } from "@/components/colors";

/** @deprecated Use theme.coursePastels */
export const COURSE_PASTEL_COLORS = lightTheme.coursePastels;

/** @deprecated Use theme.courseInk */
export const COURSE_EVENT_TEXT_COLOR = lightTheme.courseInk;

/** @deprecated Use theme.courseUnassigned */
export const UNASSIGNED_STUDY_COLOR = lightTheme.courseUnassigned;

function hashSessionId(sessionId: string): number {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i += 1) {
    hash = (hash + sessionId.charCodeAt(i) * (i + 3)) % 997;
  }
  return hash;
}

/** Pastel accent per course; palette order rotates per academic session. */
export function getCoursePastelColor(
  sessionId: string | null | undefined,
  courseIndex: number,
  theme: typeof lightTheme = lightTheme,
): string {
  const palette = theme.coursePastels;
  const offset = sessionId ? hashSessionId(sessionId) % palette.length : 0;
  return palette[(courseIndex + offset) % palette.length];
}

function sortCoursesForColor(courses: Course[]): Course[] {
  return [...courses].sort(
    (a, b) => a.name.localeCompare(b.name, "fr") || a.id.localeCompare(b.id),
  );
}

/** Stable courseId → pastel color map (same colors as Mes Cours cards). */
export function buildCourseColorMap(
  courses: Course[],
  theme: typeof lightTheme = lightTheme,
): Map<string, string> {
  const grouped = new Map<string | null, Course[]>();

  for (const course of courses) {
    const sessionId = course.session ?? null;
    const list = grouped.get(sessionId) ?? [];
    list.push(course);
    grouped.set(sessionId, list);
  }

  const map = new Map<string, string>();

  grouped.forEach((sessionCourses, sessionId) => {
    sortCoursesForColor(sessionCourses).forEach((course, index) => {
      map.set(course.id, getCoursePastelColor(sessionId, index, theme));
    });
  });

  return map;
}

export function getStudySessionColor(
  courseColorMap: Map<string, string>,
  courseId: string | undefined,
  theme: typeof lightTheme = lightTheme,
): string {
  if (!courseId) return theme.courseUnassigned;
  return courseColorMap.get(courseId) ?? theme.courseUnassigned;
}

/** Slightly deepen a pastel hex for borders and accents. */
export function shadePastelColor(hex: string, amount = 0.22): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const shade = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel * (1 - amount))));
  return `#${shade(r).toString(16).padStart(2, "0")}${shade(g)
    .toString(16)
    .padStart(2, "0")}${shade(b).toString(16).padStart(2, "0")}`;
}

export function withPastelAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
