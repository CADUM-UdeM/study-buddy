export {
  getCourseActualHoursThisWeek,
  getCoursePlannedHoursThisWeek,
} from "@/services/studyHours/StudyHoursFacade";

export function formatStudyHours(hours: number): string {
  if (hours === 0) return "0 h";
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} h` : `${rounded} h`;
}
