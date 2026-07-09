import { darkTheme, lightTheme } from "@/components/colors";
import type { DeepPartial, ThemeConfigs } from "@howljs/calendar-kit";

export function buildCalendarTheme(
  theme: typeof lightTheme,
): DeepPartial<ThemeConfigs> {
  return {
    colors: {
      primary: theme.activeColorIcon,
      onPrimary: theme.white,
      background: theme.background,
      onBackground: theme.defaultTextColor,
      border: theme.borderColor,
      text: theme.defaultTextColor,
      surface: theme.cardSurface,
      onSurface: theme.gray,
    },
    textStyle: {
      fontFamily: "PixelJersey",
    },
    hourBackgroundColor: theme.background,
    hourTextStyle: {
      fontSize: 11,
      fontFamily: "PixelJersey",
      color: theme.gray,
    },
    hourBorderColor: theme.borderColor,
    headerBackgroundColor: theme.background,
    headerBorderColor: theme.borderColor,
    dayBarBorderColor: theme.borderColor,
    dayName: {
      fontSize: 12,
      fontFamily: "PixelJersey",
      color: theme.gray,
    },
    dayNumber: {
      fontSize: 14,
      fontFamily: "PixelJersey",
      color: theme.defaultTextColor,
    },
    todayName: {
      color: theme.activeTextColor,
    },
    todayNumber: {
      color: theme.white,
    },
    todayNumberContainer: {
      backgroundColor: theme.activeColorIcon,
      borderRadius: 999,
    },
    nowIndicatorColor: theme.activeColorIcon,
    outOfRangeBackgroundColor: theme.cardGlow,
    eventContainerStyle: {
      borderRadius: 8,
      borderLeftWidth: 3,
    },
    eventTitleStyle: {
      fontSize: 12,
      fontFamily: "PixelJersey",
      fontWeight: "600",
    },
    singleDayBorderColor: theme.borderColor,
    weekNumber: {
      fontFamily: "PixelJersey",
      color: theme.gray,
    },
  };
}

export const CALENDAR_LOCALES = {
  fr: {
    weekDayShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    meridiem: { ante: "am", post: "pm" },
    more: "plus",
  },
};

export const STUDY_HOURS = {
  start: 7 * 60,
  end: 23 * 60,
};

export function getSessionEventTitle(
  session: {
    courseId?: string;
    description?: string;
  },
  courseName?: string,
): string {
  if (courseName) return courseName;
  const description = session.description?.trim();
  if (description) return description;
  return "Séance d'étude";
}

export function sessionToEvent(
  session: {
    id: string;
    courseId?: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
  },
  color: string,
  courseName?: string,
) {
  return {
    id: session.id,
    title: getSessionEventTitle(session, courseName),
    start: { dateTime: session.startDateTime },
    end: { dateTime: session.endDateTime },
    color,
    courseId: session.courseId,
    description: session.description,
  };
}

export type CalendarViewMode = "day" | "week" | "month";

export function viewModeToDays(mode: Exclude<CalendarViewMode, "month">) {
  return mode === "day" ? 1 : 7;
}
