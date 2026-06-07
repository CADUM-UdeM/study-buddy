import React, {useCallback, useMemo, useState} from "react";
import {Text, View} from "react-native";
import {sessionContext} from "@/app/context/SessionContext";
import {useFocusEffect} from "@react-navigation/core";
import IonIcons from "@expo/vector-icons/Ionicons";
import {getStyles} from './styleTracker'
import {useSettings} from "@/app/context/SettingsContext";
import {darkTheme, lightTheme} from "@/components/colors";

export default function LastStreakTracker() {
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
    const styles = getStyles();
    const textStyle = {left: 5, color: theme.defaultTextColor};

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

    const durationLastPomodoro = useMemo(() => {
        if (!lastSession) return null;
        return (parseFloat(lastSession.durationSession) +
                parseFloat(lastSession.breakSession)) *
            parseFloat(lastSession.repeatSession)
    }, [lastSession]);


    return (
        <View style={[styles.container, {backgroundColor: theme.mainWrapperBgColor, borderColor: theme.borderColor,
        }]}>
            <View className="flex-row items-center justify-between mb-2">

                {dateLastPomodoro && (
                    <View style={{flexDirection: 'row'}}>
                        <IonIcons name="time-outline"  color={theme.defaultTextColor} size={20} style={{bottom:1, right:5}}/>
                        <Text className=" font-pixel text-md" style={textStyle}>
                            Dernier pomodoro le {dateLastPomodoro} de {durationLastPomodoro} minutes.
                        </Text>
                    </View>)
                }
                {!dateLastPomodoro && (
                    <View style={{flexDirection: 'row'}}>
                        <IonIcons name="time-outline" color={theme.defaultTextColor} size={20} style={{bottom: 1, right: 5}}/>
                        <Text className=" font-pixel text-md" style={textStyle}>
                            Aucun pomodoro terminé pour le moment.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
