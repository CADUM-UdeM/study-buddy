import React, {useCallback, useMemo, useState} from "react";
import {Text, View} from "react-native";
import {sessionContext} from "@/app/context/SessionContext";
import {useFocusEffect} from "@react-navigation/core";
import IonIcons from "@expo/vector-icons/Ionicons";
import {useSettings} from "@/app/context/SettingsContext";
import {darkTheme, lightTheme} from "@/components/colors";
import {format, startOfWeek} from "date-fns";

export default function SessionTracker() {
    interface Session {
        id: string,
        durationSession: string,
        breakSession: string,
        repeatSession: string,
        isCompleted: boolean,
        isDeleteOpen: boolean,
        date: string,
    }

    const [sessions, setSessions] = useState<Session[]>([]);

    /* Variables pour css */
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;

    /* Avant de modifier historique récupère les données enregistrées. */
    useFocusEffect(
        useCallback(() => {
            /* Si on a des données, met à jour la variable contenant nos sessions */
            sessionContext.getSessionsAsync().then(setSessions);
        }, []));

    {/* Dernière session de pomodoro */
    }
    const completedSessions = useMemo(() => {
        return sessions.filter((session) => session.isCompleted);
    }, [sessions]);

    const lastSession = useMemo(() => {
        if (completedSessions.length === 0) return null;
        return completedSessions.at(-1)
    }, [completedSessions]);

    const dateLastPomodoro = useMemo(() => {
        if (!lastSession) return null;
        return lastSession.date
    }, [lastSession]);

    /* Sessions de la semaine */
    const dateWeekPomodoro =
        useMemo(() => {
            if (sessions.length === 0) return null;
            const monday = format(startOfWeek(new Date(), {weekStartsOn: 1}), 'yyyy-MM-dd');
            return sessions.filter(session => session.isCompleted && session.date >= monday)
        }, [sessions]);

    const durationStudyWeek = useMemo(() => {
        if (!dateWeekPomodoro) return null;
        return Number((dateWeekPomodoro.reduce((total: number, session: Session): number => Number(total + (
            (parseFloat(session.durationSession || '0') + parseFloat(session.breakSession || '0')) *
            parseFloat(session.repeatSession || '0'))), 0)).toFixed(2));
    }, [dateWeekPomodoro]);

    const hasPomodoroThisWeek = Boolean(dateWeekPomodoro?.length);
    return (

        <View style={{
            backgroundColor: theme.mainWrapperBgColor,
            borderWidth: 1, borderColor: theme.borderColor, flexDirection: "row",
            borderRadius: 15, alignSelf: 'center', width: '100%', paddingHorizontal: 20
        }} className="rounded-2xl p-1 mb-3">

            {/* ---------- Temps d'étude sur la semaine actuelle ---------- */}
            <View style={{alignItems: 'center', justifyContent:'center',  flexDirection: "row", width: '50%'}}>
                <IonIcons name="hourglass-outline" color={theme.defaultTextColor} size={25}
                          style={{bottom: 1, right: 5}}/>
                {/* Si pomodoro */}
                {hasPomodoroThisWeek && (
                    <View>
                        <Text className="font-pixel"
                              style={{color: theme.defaultTextColor, fontSize: 18}}> {durationStudyWeek} min</Text>
                        <Text className="font-pixel"
                              style={{color: theme.gray, fontSize: 12}}> d&#39;étude/semaine</Text>
                    </View>
                )}
                {/* S'il y en a pas  */}
                {!hasPomodoroThisWeek && (
                    <View style={{flexDirection: 'row'}}>

                        <Text className="text-neutral-500 font-pixel"
                              style={{color: theme.gray, fontSize: 12}}>
                            Pas d&#39;étude {`\n`} cette semaine
                        </Text>
                    </View>
                )}
            </View>
            {/* ----------  ---------- */}

            {/* ---------- Dernier pomodoro ---------- */}

            <View style={{alignItems: 'center',  justifyContent:'center', flexDirection: "row", width: '50%' }}>
                <IonIcons name="calendar-outline" color={theme.defaultTextColor} size={25}
                          style={{bottom: 1, right: 5}}/>
                {/* Si pomodoro */}
                {dateLastPomodoro && (
                    <View>
                        <Text className="font-pixel"
                              style={{color: theme.defaultTextColor, fontSize: 18}}> {dateLastPomodoro}</Text>
                        <Text className="font-pixel"
                              style={{color: theme.gray, fontSize: 12}}> dernière étude</Text>
                    </View>
                )}
                {/* S'il y en a pas  */}
                {!dateLastPomodoro && (
                    <View style={{flexDirection: 'row'}}>
                        <Text className="text-neutral-500 font-pixel"
                              style={{color: theme.gray, fontSize: 12}}>
                            Aucun pomodoro {`\n`} terminé.
                        </Text>
                    </View>
                )}
            </View>
            {/* ----------  ---------- */}

        </View>
    );
}
