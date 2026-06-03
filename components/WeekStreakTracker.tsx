import React, {useCallback, useMemo, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {sessionContext} from "@/app/context/SessionContext";
import {useFocusEffect} from "@react-navigation/core";
import IonIcons from "@expo/vector-icons/Ionicons";
import {startOfWeek, endOfWeek, format} from 'date-fns';
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
        <View style={[styles.container,]}>
            <View className="flex-row items-center justify-between mb-2">

                {dateWeekPomodoro && (
                    <View style={{flexDirection: 'row'}}>
                        <IonIcons name="hourglass-outline"  color={"#525252"} size={20} style={{bottom:1, right:5}}/>
                        <Text className="text-neutral-600 font-pixel text-md" style={{left:5}}>
                            Temps d&#39;étude cette semaine : {durationStudyWeek} minutes
                        </Text>
                    </View>)
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1729",
        borderRadius: 12,
        padding: 16,
        paddingBottom:2,
        paddingTop:8,
        marginVertical: 0,
    },

});
