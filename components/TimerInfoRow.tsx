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
        <View className="rounded-2xl flex-row items-center justify-center gap-4 py-4 mt-3"
        >
            {/* ---Temps de focus ---*/}
            <View style={{alignItems: 'center'}}>
                <Text className=" text-lg font-pixel"
                      style={{color: theme.defaultTextColor}}>Focus</Text>
                <Text className=" text-xl font-pixel"
                      style={{color: theme.anotherTextColor}}>{pomodoroDuration} min</Text>
            </View>

            {/* --- Separation ---*/}
            <View style={{
                width: 1, height: 24, backgroundColor: theme === lightTheme ?
                    "rgba(124,58,237,0.2)" : "rgba(109,40,217,0.15)"
            }}/>

            {/* ---Temps de pause ---*/}
            <View style={{alignItems: 'center'}}>
                <Text className=" text-lg font-pixel"
                      style={{color: theme.defaultTextColor}}>Pause</Text>
                <Text className=" text-xl font-pixel"
                      style={{color: theme.anotherTextColor}}>{breakDuration} min</Text>
            </View>

            {/* --- Separation ---*/}
            <View style={{
                width: 1, height: 24, backgroundColor: theme === lightTheme ?
                    "rgba(124,58,237,0.2)" : "rgba(109,40,217,0.15)"
            }}/>

            {/* ---Nombre de cycle ---*/}
            <View style={{alignItems: 'center'}}>
                <Text className=" text-lg font-pixel"
                      style={{color: theme.defaultTextColor}}>Cycle</Text>
                <Text className=" text-xl font-pixel"
                      style={{color: theme.anotherTextColor}}>{numCycle}</Text>
            </View>
        </View>
    );
};