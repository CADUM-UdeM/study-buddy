import {View, Text} from "react-native";
import {darkTheme, lightTheme} from "@/components/colors";
import {useSettings} from "@/app/context/SettingsContext";
import IonIcons from "@expo/vector-icons/Ionicons";
import React from "react";


interface infoParams {
    pomodoroDuration: string;
    breakDuration: string;
    numCycle: number;
}

export const TimerInfoRow = ({pomodoroDuration, breakDuration, numCycle}: infoParams) => {
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;
    const cardBg = {backgroundColor: theme.mainWrapperBgColor};


    return (
    <View
        className="rounded-2xl flex-row items-center justify-center gap-4 py-4 mb-4"
        style={cardBg}
    >
        {/* ---Temps de focus ---*/}
        <IonIcons name="time-outline" size={22} color="#e0aaff"/>
        <Text className=" text-xl font-pixel"
              style={{color: theme.defaultTextColor}}>{pomodoroDuration} min</Text>

        {/* ---Temps de pause ---*/}
        <IonIcons name="cafe-outline" size={22} color="#e0aaff"/>
        <Text className=" text-xl font-pixel"
              style={{color: theme.defaultTextColor}}>{breakDuration} min</Text>

        {/* ---Nombre de cycle ---*/}
        <IonIcons name="refresh-outline" size={22} color="#e0aaff"/>
        <Text className=" text-xl font-pixel" style={{color: theme.defaultTextColor}}>{numCycle}</Text>
    </View>
    );
};