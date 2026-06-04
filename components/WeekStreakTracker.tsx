import React, {useCallback, useMemo, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {sessionContext} from "@/app/context/SessionContext";
import {useFocusEffect} from "@react-navigation/core";
import IonIcons from "@expo/vector-icons/Ionicons";
import {startOfWeek, endOfWeek, format} from 'date-fns';
import styleTracker, {getStyles} from './styleTracker'
import {useSettings} from "@/app/context/SettingsContext";
import {darkTheme, lightTheme} from "@/components/colors";


export default function WeekStreakTracker() {
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
    const [totalContributions, setTotalContributions] = useState(0);

    /* Variables pour css */
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;
    const styles = getStyles();

    /* Avant de modifier historique récupère les données enregistrées. */
    useFocusEffect(
        useCallback(() => {
            /* Si on a des données, met à jour la variable contenant nos sessions */
            sessionContext.getSessionsAsync().then(setSessions);
            setTotalContributions(sessions.length);
        }, [sessions.length]));

    /* Sessions de la semaine */
    const dateWeekPomodoro =
        useMemo(() => {
        if (sessions.length === 0) return null;
        const monday =format(startOfWeek(new Date(), {weekStartsOn: 1}), 'yyyy-MM-dd');
        return sessions.filter(session => session.date >= monday)
    }, [sessions]);

    const durationStudyWeek = useMemo(() => {
        if (!dateWeekPomodoro) return null;
        return dateWeekPomodoro.reduce((total: number, session : Session) : number => Number(total + (
            (parseFloat(session.durationSession || '0') + parseFloat(session.breakSession || '0')) *
            parseFloat(session.repeatSession || '0')  )),0)
    }, [dateWeekPomodoro]);
    return (
        <View style={[styles.container, {backgroundColor: theme.mainWrapperBgColor, borderColor: theme.borderColor}]}>
            <View className="flex-row items-center justify-between mb-2">

                {dateWeekPomodoro && (
                    <View style={{flexDirection: 'row',}}>
                        <IonIcons name="hourglass-outline"  color={theme.defaultTextColor} size={20} style={{bottom:1, right:5}}/>
                        <Text className=" font-pixel text-md" style={{left:5, color:theme.defaultTextColor}}>
                            Temps d&#39;étude cette semaine : {durationStudyWeek} minutes
                        </Text>
                    </View>)
                }
            </View>
        </View>
    );
}

