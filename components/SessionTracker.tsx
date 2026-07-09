import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useStudyHours } from "@/app/hooks/useStudyHours";
import IonIcons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/app/context/SettingsContext";
import { darkTheme, lightTheme } from "@/components/colors";

export default function SessionTracker({ embedded = false }: { embedded?: boolean }) {
  const { settings } = useSettings();
  const theme = settings.isDarkMode ? darkTheme : lightTheme;
  const { getWeeklyStudyMinutes, getLastStudyDate } = useStudyHours();

  const durationStudyWeek = useMemo(
    () => getWeeklyStudyMinutes(),
    [getWeeklyStudyMinutes],
  );

  const dateLastPomodoro = useMemo(
    () => getLastStudyDate(),
    [getLastStudyDate],
  );

  const hasPomodoroThisWeek = durationStudyWeek > 0;

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "center",
        width: "100%",
        paddingHorizontal: embedded ? 4 : 20,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          width: "50%",
        }}
      >
        <IonIcons
          name="hourglass-outline"
          color={theme.defaultTextColor}
          size={25}
          style={{ bottom: 1, right: 5 }}
        />
        {hasPomodoroThisWeek ? (
          <View>
            <Text
              className="font-pixel"
              style={{ color: theme.defaultTextColor, fontSize: 18 }}
            >
              {durationStudyWeek} min
            </Text>
            <Text className="font-pixel" style={{ color: theme.gray, fontSize: 12 }}>
              d&apos;étude/semaine
            </Text>
          </View>
        ) : (
          <Text className="font-pixel" style={{ color: theme.gray, fontSize: 12 }}>
            Pas d&apos;étude{"\n"}cette semaine
          </Text>
        )}
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          width: "50%",
        }}
      >
        <IonIcons
          name="calendar-outline"
          color={theme.defaultTextColor}
          size={25}
          style={{ bottom: 1, right: 5 }}
        />
        {dateLastPomodoro ? (
          <View>
            <Text
              className="font-pixel"
              style={{ color: theme.defaultTextColor, fontSize: 18 }}
            >
              {dateLastPomodoro}
            </Text>
            <Text className="font-pixel" style={{ color: theme.gray, fontSize: 12 }}>
              dernière étude
            </Text>
          </View>
        ) : (
          <Text className="font-pixel" style={{ color: theme.gray, fontSize: 12 }}>
            Aucune session{"\n"}enregistrée.
          </Text>
        )}
      </View>
    </View>
  );

  if (embedded) {
    return content;
  }

  return (
    <View
      style={{
        backgroundColor: theme.mainWrapperBgColor,
        borderWidth: 1,
        borderColor: theme.borderColor,
        flexDirection: "row",
        borderRadius: 15,
        alignSelf: "center",
        width: "100%",
        paddingHorizontal: 20,
      }}
      className="rounded-2xl p-1 mb-3"
    >
      {content}
    </View>
  );
}
