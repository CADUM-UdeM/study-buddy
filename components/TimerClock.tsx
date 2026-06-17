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
                               remainingCycle
                           }: infoParams) => {
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;


    return (
        <View className="rounded-2xl p-6 mb-4"
              style={{
                  backgroundColor: inBreakTime ?
                      theme.borderColor : theme.mainWrapperBgColor,
                  borderWidth: 1, borderColor: inBreakTime ? theme.circleColor : theme.borderColor
              }}>

            {/* --- Indicateur du mode Focus ou Pause ---*/}
            <Text className="text-center text-lg  mb-6 font-pixel text-[20px]"
                  style={{color: theme.defaultTextColor}}>{!inBreakTime ? "Focus" : "Pause"}</Text>

            {/* ---Cercle qui tourne ---*/}
            <View className="flex-row items-center justify-center gap-4">
                <AnimatedCircularProgress size={176} width={8}
                                          fill={phaseTotalSeconds > 0 ? (timeLeft / phaseTotalSeconds) * 100 : 100}
                                          tintColor={theme.circleColor}
                                          backgroundColor={theme === lightTheme ?
                                              theme.background : theme.contentWrapperBgColor}
                                          rotation={0} lineCap="round">

                    {() => (<Text className="text-3xl font-pixel "
                                  style={{color: theme.defaultTextColor}}>{hours}:{min}:{sec}</Text>)}
                </AnimatedCircularProgress>
            </View>
            {/* ------ */}

            {/* ---Bouton paramètre pomodoro ---*/}
            <View className="flex-row items-center justify-center gap-6 mt-5">
                <TouchableOpacity onPress={() => setClickParam(!clickParam)} disabled={isRunning}
                                  className="rounded-full p-2"
                                  style={{backgroundColor: !isRunning ? theme.buttonColor : "#6B7280"}}>
                    <IonIcons name="options-outline" size={20} color="#10002b"/></TouchableOpacity>

                {/* --- Nombre de cycle restant ---*/}
                <View className="rounded-xl px-4 py-2" style={{backgroundColor: "#AB8BFF40"}}>
                    <Text className="text-lg font-semibold font-pixel" style={{color: theme.defaultTextColor}}>
                        Cycle : {remainingCycle}
                    </Text>
                </View>

            </View>
        </View>
    );
};