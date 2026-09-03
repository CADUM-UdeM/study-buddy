import React from "react";
import {StyleSheet, Pressable, Text, View} from "react-native";
import {getPastelChipStyle} from "@/components/home/pastelStyles";
import IonIcons from "@expo/vector-icons/Ionicons";
import {Minus, Plus} from "lucide-react-native";
import {useStudyHours} from "@/app/hooks/useStudyHours";
import {lightTheme} from "@/components/colors";


interface StudyInfoCalendarProps {
    isDayView: boolean;
    isSessionView: boolean;
    setIsSessionView: React.Dispatch<React.SetStateAction<boolean>>;
    calendarSize : number;
    setCalendarSize: React.Dispatch<React.SetStateAction<number>>;
    actualDate: Date;
    theme: typeof lightTheme;
}

export default function StudyInfoCalendar({
                                              isDayView,
                                              isSessionView,
                                              setIsSessionView,
                                              calendarSize,
                                              setCalendarSize,
                                              actualDate,
                                              theme,
                                          }: StudyInfoCalendarProps) {

    const {
        getWeeklyStudyMinutes, getDailyStudyMinutes,
        getPlannedSessionsCountByDate, getPlannedSessionsForWeek,
    } = useStudyHours();

    const numberOfPlannedSessions = isDayView ?
        getPlannedSessionsCountByDate(actualDate) : getPlannedSessionsForWeek(actualDate)

    const timeOnPomodoro = isDayView ?
        getDailyStudyMinutes(actualDate) : getWeeklyStudyMinutes(actualDate);

    const limitCalendarSize = 30;
    const handleCalendarSize = (isZoom: boolean) => {
        setCalendarSize(s => isZoom && s <= limitCalendarSize ? s * 2
            : !isZoom && s >= limitCalendarSize ? s / 2
                : s);
    }

    return (
    <View style={{flexDirection:'row'}}>
        <Pressable
            className="mx-5 mb-2 rounded-xl px-3 py-2"
            style={[getPastelChipStyle(theme), {flexDirection: "row", width:120,
                backgroundColor: isSessionView ? theme.activeColorIcon : theme.cardSurface,}]}
            onPress={() => (setIsSessionView(true))}
        >
            <IonIcons name="school-outline" color={
                isSessionView ? theme.white : theme.defaultTextColor} size={20} style={{ bottom: 1, paddingRight: 8 }}
            />
            <Text className="font-pixel text-sm" style={{ color:  isSessionView ? theme.white :theme.gray }}>
                {numberOfPlannedSessions} session{numberOfPlannedSessions > 1 ? "s" : ""}
            </Text>
        </Pressable>
        <Pressable
            className="mb-2 rounded-xl px-3 py-2"
            style={[getPastelChipStyle(theme), {flexDirection: "row", width:120,
                backgroundColor: !isSessionView ? theme.activeColorIcon : theme.cardSurface,}]}
            onPress={() => (setIsSessionView(false))}

        >
            <IonIcons name="hourglass-outline" color={!isSessionView ? theme.white : theme.defaultTextColor} size={20} style={{ bottom: 1, right: 5 }}
            />
            <Text className="font-pixel text-sm" style={{ color:  !isSessionView ? theme.white :theme.gray }}>
                {timeOnPomodoro} min pomodoro
            </Text>
        </Pressable>

        {/* Changer taille du calendrier */}
        <View
            style={{
            marginLeft:20,
            alignContent:'center',
            alignItems:'center',
            flexDirection: 'row',
            overflow:'hidden',
            height:40,
            width:90,
            borderRadius:15,
            borderWidth: 1,
            borderColor: theme.borderColor,
           }}>
        <Pressable
            onPress={() => handleCalendarSize(true)}
            style={[getPastelChipStyle(theme), styles.pressableZoom,
                {borderRightColor:theme.cardBorderSoft,
                backgroundColor: calendarSize <= limitCalendarSize ? theme.cardSurface : theme.cardGlow }]}
        >
            <Minus size={20} color={theme.defaultTextColor} strokeWidth={2} />
        </Pressable>
        <Pressable
            onPress={() => handleCalendarSize(false)}
            style={[getPastelChipStyle(theme),styles.pressableZoom,
                { backgroundColor: calendarSize >= limitCalendarSize ? theme.cardSurface : theme.cardGlow }]}
        >
            <Plus size={20} color={theme.defaultTextColor} strokeWidth={2} />
        </Pressable>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    pressableZoom:{
        flex:1, height:'100%', borderRadius:0, alignItems:'center', justifyContent:'center', borderColor: 'transparent',
    }
})