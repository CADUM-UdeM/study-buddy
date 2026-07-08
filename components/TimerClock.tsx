import {View, Text, TouchableOpacity} from "react-native";
import {darkTheme, lightTheme} from "@/components/colors";
import {useSettings} from "@/app/context/SettingsContext";
import IonIcons from "@expo/vector-icons/Ionicons";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import React from "react";


interface infoParams {
    inBreakTime: boolean;
    phaseTotalSeconds: number;
    timeLeft: number;
    hours: string;
    min: string;
    sec: string;
    isRunning: boolean;
    setClickParam: React.Dispatch<React.SetStateAction<boolean>>;
    clickParam: boolean;
    remainingCycle: number;
    numCycle: number;
}

export const TimerClock = ({
                               inBreakTime,
                               phaseTotalSeconds,
                               timeLeft,
                               hours,
                               min,
                               sec,
                               isRunning,
                               setClickParam,
                               clickParam,
                               remainingCycle,
                               numCycle
                           }: infoParams) => {
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;


    return (
        <View>

            {/* ---Bouton paramètre pomodoro ---*/}
            <View className="relative flex-row items-center justify-center w-full gap-2 mt-5 mb-6">
                {/* --- Indicateur du mode Focus ou Pause ---*/}
                <Text className="text-center text-lg font-pixel text-[20px]"
                      style={{color: theme.defaultTextColor}}>{!inBreakTime ? "Focus" : "Pause"}</Text>
            </View>
            {/* ---Cercle qui tourne ---*/}
            <View className="flex-row items-center justify-center gap-4">
                <AnimatedCircularProgress size={176} width={8}
                                          fill={phaseTotalSeconds > 0 ? (timeLeft / phaseTotalSeconds) * 100 : 100}
                                          tintColor={theme.circleColor}
                                          backgroundColor={theme === lightTheme ?
                                              theme.background : theme.contentWrapperBgColor}
                                          rotation={0} lineCap="round">

                    {() => (<View>
                        <Text className="text-3xl font-pixel "
                                        style={{color: theme.defaultTextColor}}>{hours}:{min}:{sec}</Text></View>)}
                </AnimatedCircularProgress>
            </View>
            {/* ------ */}

            {/* --- Nombre de cycle restant ---*/}
            <View style={{alignItems: 'center', gap: 8, paddingTop: 20,}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    {Array.from({length: numCycle}).map((_, i) => {
                        const isActive = i === (numCycle - remainingCycle);
                        const isDone = i < (numCycle - remainingCycle);
                        let color = theme.cycleDefault;
                        if (isActive) color = theme.cycleActive;
                        if (isDone) color = theme.cycleInactive;
                        return (
                            <View key={i} style={{
                                height: 7, borderRadius: 4,
                                width: isActive ? 20 : 7, backgroundColor: color,
                            }}/>);
                    })}
                </View>
            </View>
            {/* ------ */}

        </View>

    );
};