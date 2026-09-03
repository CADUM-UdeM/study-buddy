import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useStudyHours } from "@/app/hooks/useStudyHours";
import { useSettings } from "@/app/context/SettingsContext";
import { darkTheme, lightTheme } from "@/components/colors";
import { getRecordsInDateRange } from "@/services/studyHours/StudyHoursFacade";

export default function ContributionTracker({ embedded = false }: { embedded?: boolean }) {
  const getCurrentSession = () => {
    const now = new Date();
    const month = now.getMonth();

    let sessionName : string;
    let startMonth : number;
    let endMonth: number;

    if (month >= 0 && month <= 3) {
      sessionName = "Hiver";
      startMonth = 0;
      endMonth = 3;
    } else if (month >= 4 && month <= 7) {
      sessionName = "Été";
      startMonth = 4;
      endMonth = 7;
    } else {
      sessionName = "Automne";
      startMonth = 8;
      endMonth = 11;
    }

    const year = now.getFullYear();
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0);

    return { sessionName, startDate, endDate };
  };

  const { sessionName, startDate, endDate } = getCurrentSession();
  const { settings } = useSettings();
  const theme = settings.isDarkMode ? darkTheme : lightTheme;
  const { records, getContributionsByDate } = useStudyHours();

  const sessionRecords = useMemo(
    () => getRecordsInDateRange(records, startDate, endDate),
    [endDate, records, startDate],
  );

  const totalContributions = sessionRecords.length;
  const contributions = useMemo(
    () => getContributionsByDate(),
    [getContributionsByDate],
  );

  const generateWeeks = () => {
    const weeks: (Date | null)[][] = [];
    const firstDay = new Date(startDate);
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstDay.setDate(firstDay.getDate() - daysToMonday);

    let currentDate = new Date(firstDay);

    while (currentDate <= endDate) {
      const week: (Date | null)[] = [];

      for (let day = 0; day < 7; day++) {
        if (currentDate < startDate || currentDate > endDate) {
          week.push(null);
        } else {
          week.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
      if (weeks.length > 20) break;
    }

    return weeks;
  };

  const getColor = (count: number) => {
    if (count === 0) return theme.calendarZero;
    if (count <= 3) return theme.calendarLevelOne;
    if (count <= 6) return theme.calendarLevelTwo;
    if (count <= 10) return theme.calendarLevelThree;
    return theme.calendarLevelFour;
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const weeks = generateWeeks();
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 32;
  const dayLabelsWidth = 35;
  const availableWidth = screenWidth - containerPadding - dayLabelsWidth - 18;
  const numberOfWeeks = weeks.length;
  const gap = 3;
  const squareSize = Math.floor(
    (availableWidth - gap * (numberOfWeeks - 1)) / numberOfWeeks,
  );

  const getMonthLabels = () => {
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const labels: { month: string; position: number }[] = [];

    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDay = week.find((day) => day !== null);
      if (firstDay) {
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], position: weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  const content = (
    <>
      <Text style={[styles.title, { color: theme.defaultTextColor }]}>
        {totalContributions} pomodoro{totalContributions > 1 ? "s" : ""} cette session ({sessionName})
      </Text>

      <View style={styles.content}>
        <View style={[styles.monthsRow]}>
          {monthLabels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.monthLabel,
                { left: dayLabelsWidth + label.position * (squareSize + gap) },
              ]}
            >
              {label.month}
            </Text>
          ))}
        </View>

        <View style={styles.graphContainer}>
          <View style={styles.dayLabels}>
            <Text style={styles.dayLabel}>Lun</Text>
            <View style={{ height: squareSize }} />
            <Text style={styles.dayLabel}>Mer</Text>
            <View style={{ height: squareSize }} />
            <Text style={styles.dayLabel}>Ven</Text>
          </View>

          <View style={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={[styles.column, { gap }]}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <View
                        key={dayIndex}
                        style={[
                          styles.emptySquare,
                          { width: squareSize, height: squareSize },
                        ]}
                      />
                    );
                  }

                  const dateStr = formatDate(day);
                  const count = contributions[dateStr] || 0;
                  const color = getColor(count);

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.square,
                        {
                          backgroundColor: color,
                          width: squareSize,
                          height: squareSize,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>Moins</Text>
          {[theme.calendarZero, theme.calendarLevelOne, theme.calendarLevelTwo, theme.calendarLevelThree, theme.calendarLevelFour].map(
            (color, index) => (
              <View
                key={index}
                style={[
                  styles.legendSquare,
                  { backgroundColor: color, width: squareSize, height: squareSize },
                ]}
              />
            ),
          )}
          <Text style={styles.legendText}>Plus</Text>
        </View>
      </View>
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.mainWrapperBgColor,
          borderRadius: 25,
          borderColor: theme.borderColor,
          borderWidth: 1,
        },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 10,
  },
  embedded: {
    paddingVertical: 2,
  },
  title: {
    fontFamily: "PixelJersey",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
  },
  content: {},
  monthsRow: {
    height: 18,
    position: "relative",
    marginBottom: 4,
  },
  monthLabel: {
    fontFamily: "PixelJersey",
    position: "absolute",
    color: "#9CA3AF",
    fontSize: 10,
  },
  graphContainer: {
    flexDirection: "row",
  },
  dayLabels: {
    justifyContent: "space-between",
    marginRight: 6,
    paddingTop: 2,
  },
  dayLabel: {
    fontFamily: "PixelJersey",
    color: "#9CA3AF",
    fontSize: 9,
  },
  grid: {
    flexDirection: "row",
    gap: 3,
  },
  column: {},
  square: {
    borderRadius: 2,
  },
  emptySquare: {},
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 3,
    justifyContent: "flex-end",
  },
  legendText: {
    fontFamily: "PixelJersey",
    color: "#9CA3AF",
    fontSize: 10,
  },
  legendSquare: {
    borderRadius: 2,
  },
});
