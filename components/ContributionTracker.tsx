import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { colors } from "../app/theme/colors";

export default function ContributionTracker() {
  // Détermine la session actuelle et ses dates
  const getCurrentSession = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    let sessionName = "";
    let startMonth = 0;
    let endMonth = 3;

    if (month >= 0 && month <= 3) {
      // Janvier à Avril = Session Hiver
      sessionName = "Hiver";
      startMonth = 0; // Janvier
      endMonth = 3; // Avril
    } else if (month >= 4 && month <= 7) {
      // Mai à Août = Session Été
      sessionName = "Été";
      startMonth = 4; // Mai
      endMonth = 7; // Août
    } else {
      // Septembre à Décembre = Session Automne
      sessionName = "Automne";
      startMonth = 8; // Septembre
      endMonth = 11; // Décembre
    }

    const year = now.getFullYear();
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0); // Dernier jour du mois

    return { sessionName, startDate, endDate };
  };

  // Génère des données de démo pour la session
  const generateDemoData = () => {
    const data: Record<string, number> = {};
    const { startDate, endDate } = getCurrentSession();

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Données aléatoires pour la démo
      const random = Math.random();
      if (random > 0.3) {
        data[dateStr] = Math.floor(Math.random() * 15);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const contributions = generateDemoData();
  const { sessionName, startDate, endDate } = getCurrentSession();

  // Génère les semaines de la session
  const generateWeeks = () => {
    const weeks: (Date | null)[][] = [];

    // Commence au début de la session
    const firstDay = new Date(startDate);

    // Ajuste pour commencer un lundi
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstDay.setDate(firstDay.getDate() - daysToMonday);

    let currentDate = new Date(firstDay);

    // Continue jusqu'à la fin de la session
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

      // Sécurité pour éviter une boucle infinie
      if (weeks.length > 20) break;
    }

    return weeks;
  };

  // Obtient la couleur selon le nombre de contributions (palette theme)
  const getColor = (count: number) => {
    if (count === 0) return colors.darkAmethyst2;
    if (count <= 3) return colors.indigoInk;
    if (count <= 6) return colors.indigoVelvet;
    if (count <= 10) return colors.lavenderPurple;
    return colors.mauve;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const weeks = generateWeeks();
  const totalContributions = Object.values(contributions).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Calcule la taille des carrés dynamiquement (GARDÉ LA MÊME LOGIQUE)
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 32;
  const dayLabelsWidth = 35;
  const availableWidth = screenWidth - containerPadding - dayLabelsWidth - 18;
  const numberOfWeeks = weeks.length; // Maintenant basé sur la session
  const gap = 3;
  const squareSize = Math.floor(
    (availableWidth - gap * (numberOfWeeks - 1)) / numberOfWeeks,
  );

  // Obtient les labels de mois
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {totalContributions} séances d'études cette session
      </Text>

      <View style={styles.content}>
        {/* Labels des mois */}
        <View style={styles.monthsRow}>
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
          {/* Labels des jours */}
          <View style={styles.dayLabels}>
            <Text style={styles.dayLabel}>Lun</Text>
            <View style={{ height: squareSize }} />
            <Text style={styles.dayLabel}>Mer</Text>
            <View style={{ height: squareSize }} />
            <Text style={styles.dayLabel}>Ven</Text>
          </View>

          {/* Grille */}
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

        {/* Légende */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>Moins</Text>
          <View
            style={[
              styles.legendSquare,
              {
                backgroundColor: colors.darkAmethyst2,
                width: squareSize,
                height: squareSize,
              },
            ]}
          />
          <View
            style={[
              styles.legendSquare,
              {
                backgroundColor: colors.indigoInk,
                width: squareSize,
                height: squareSize,
              },
            ]}
          />
          <View
            style={[
              styles.legendSquare,
              {
                backgroundColor: colors.indigoVelvet,
                width: squareSize,
                height: squareSize,
              },
            ]}
          />
          <View
            style={[
              styles.legendSquare,
              {
                backgroundColor: colors.lavenderPurple,
                width: squareSize,
                height: squareSize,
              },
            ]}
          />
          <View
            style={[
              styles.legendSquare,
              {
                backgroundColor: colors.mauve,
                width: squareSize,
                height: squareSize,
              },
            ]}
          />
          <Text style={styles.legendText}>Plus</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    color: colors.white,
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
    position: "absolute",
    color: colors.textOnDarkMuted,
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
    color: colors.textOnDarkMuted,
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
    color: colors.textOnDarkMuted,
    fontSize: 10,
  },
  legendSquare: {
    borderRadius: 2,
  },
});
