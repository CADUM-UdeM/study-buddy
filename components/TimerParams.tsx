import {
    Modal, Pressable, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from "react-native";
import {darkTheme, lightTheme} from "@/components/colors";
import {useSettings} from "@/app/context/SettingsContext";
import IonIcons from "@expo/vector-icons/Ionicons";
import React, {useState} from "react";

export const DEFAULT_REPETITION = 2;
export const DEFAULT_STUDY_TIME = '30';
export const DEFAULT_BREAK_TIME = '10';


interface infoParams {
    clickParam: boolean;
    setClickParam: React.Dispatch<React.SetStateAction<boolean>>;
    setNumCycle: React.Dispatch<React.SetStateAction<number>>;
    setPomodoroDuration: React.Dispatch<React.SetStateAction<string>>;
    setBreakDuration: React.Dispatch<React.SetStateAction<string>>;
    numCycle: number;
    pomodoroDuration: string;
    breakDuration: string;
    updateTime: (minutes: number) => void;
}

export const TimerParams = ({
                                clickParam,
                                setClickParam,
                                setNumCycle,
                                setPomodoroDuration,
                                setBreakDuration,
                                numCycle,
                                pomodoroDuration,
                                breakDuration,
                                updateTime
                            }: infoParams) => {

    { /* -------------- Constantes -------------- */
    }
    const {settings} = useSettings();
    const theme = settings.isDarkMode ? darkTheme : lightTheme;
    const cardBg = {backgroundColor: theme.mainWrapperBgColor};
    const [clickSelectStudy, setClickSelectStudy] = useState(false)
    const [clickSelectBreak, setClickSelectBreak] = useState(false)
    const [defaultRepetition, setDefaultRepetition] = useState(DEFAULT_REPETITION)
    const [defaultStudyTime, setDefaultStudyTime] = useState(DEFAULT_STUDY_TIME)
    const [defaultBreakTime, setDefaultBreakTime] = useState(DEFAULT_BREAK_TIME)


    { /* -------------- Fonctions -------------- */
    }

    {/*  Gere le texte -------------------- */
    }
    const handleStudyText = (text: string) => {
        let cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*^)\./g, '')
        cleaned = cleanText(cleaned)
        setDefaultStudyTime(cleaned)
    }

    const cleanText = (cleaned: string) => {
        const pos = cleaned.indexOf('.')
        /* Évite plusieurs points */
        if (pos > -1) {
            cleaned = cleaned.replace(/[^0-9]/g, '')
            cleaned = cleaned.slice(0, pos) + '.' + cleaned.slice(pos)
        }
        if (cleaned.length < 1) cleaned = '0'
        return cleaned
    }

    const handleBreakText = (text: string) => {
        let cleaned = text.replace(/[^0-9.]/g, '')
        cleaned = cleanText(cleaned)
        setDefaultBreakTime(cleaned)
    }


    {/*  Gere les clics -------------------- */
    }
    const clickRepeat = (index: number) => {
        setDefaultRepetition(index)
    }
    const clickStudyTime = (index: string) => {
        setDefaultStudyTime(index)
    }
    const clickBreakTime = (index: string) => {
        setDefaultBreakTime(index)
    }
    { /* --------------  -------------- */
    }

    return (
        <View>
            {/* --- Params modal --- */}
            <Modal transparent visible={clickParam} animationType="fade">

                {/* -------------- Decors transparent noir -------------- */}
                <Pressable
                    style={{
                        flex: 1, justifyContent: 'center',
                        alignItems: 'center', backgroundColor: "rgba(0,0,0,0.6)"
                    }}
                    onPress={() => setClickParam(false)}>

                    {/* -------------- Contenu du modal -------------- */}
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={{
                            borderRadius: 20, padding: 20, width: '85%',
                            height: "77%", ...cardBg, borderColor: theme.borderColor,
                            borderWidth: 1, backgroundColor: theme.mainWrapperBgColor
                        }}>

                            {/* -------------- Titre modal -------------- */}
                            <Text className="text-2xl  font-pixel" style={{
                                paddingTop: 10, paddingBottom: 20, textAlign: "center", color: theme.defaultTextColor
                            }}>Réglez votre pomodoro</Text>

                            {/* -------------- Selection temps d'étude -------------- */}
                            <View style={{padding: 10, gap: 20, zIndex: 3}}>
                                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2"
                                      style={cardBg}>
                                    <Text className=" font-pixel text-xl" style={{color: theme.defaultTextColor}}
                                    >Temps d&apos;étude</Text>
                                    <View>
                                        <TouchableOpacity
                                            className="flex-row items-center gap-1 rounded-lg px-3 py-2"
                                            style={{backgroundColor: theme.contentWrapperBgColor}}
                                            onPress={() => setClickSelectStudy(!clickSelectStudy)}
                                        >
                                            <TextInput
                                                keyboardType="numeric" maxLength={4}
                                                className=" min-w-[40px] font-pixel"
                                                style={{
                                                    padding: 0, height: 24,
                                                    fontSize: 20, color: theme.defaultTextColor
                                                }}
                                                value={`${defaultStudyTime}`} onChangeText={handleStudyText}
                                            />
                                            <Text className=" font-pixel text-xl"
                                                  style={{color: theme.defaultTextColor}}>min</Text>
                                            <IonIcons name="chevron-down" size={20} color="#e0aaff"/>
                                        </TouchableOpacity>

                                        {clickSelectStudy && (<>
                                                <Pressable
                                                    onPress={() => setClickSelectStudy(false)}
                                                    style={{
                                                        position: 'absolute',
                                                        /* Prend tout l'écran*/
                                                        top: -1000, bottom: -1000, left: -1000, right: -1000, zIndex: 1,
                                                    }}/>
                                                <View
                                                    style={[cardBg, {
                                                        position: 'absolute', top: 40, right: -2,
                                                        width: 120, borderRadius: 12, padding: 5, zIndex: 2,
                                                    }]}>
                                                    {["10", "20", "30", "40", "50", "60"].map((m) => (
                                                        <TouchableOpacity
                                                            key={m}
                                                            onPress={() => clickStudyTime(m)}
                                                            className="rounded-lg py-2 items-center"
                                                            style={{
                                                                backgroundColor: defaultStudyTime === m ? theme.buttonColor : theme.contentWrapperBgColor,
                                                                marginBottom: 4,
                                                            }}>
                                                            <Text
                                                                className={"font-pixel"}
                                                                style={{color: defaultStudyTime === m ? theme.anotherTextColor : theme.defaultTextColor}}>
                                                                {m} min
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>
                                {/* -------------- Fin Selection -------------- */}

                                {/* -------------- Selection temps de pause -------------- */}
                                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2"
                                      style={cardBg}>
                                    <Text className=" font-pixel text-xl" style={{color: theme.defaultTextColor}}>Temps
                                        de pause </Text>
                                    <View>

                                        <TouchableOpacity
                                            className="flex-row items-center gap-1 rounded-lg px-3 py-2"
                                            style={{backgroundColor: theme.contentWrapperBgColor}}
                                            onPress={() => setClickSelectBreak(!clickSelectBreak)}
                                        >
                                            <TextInput
                                                keyboardType="numeric"
                                                maxLength={4}
                                                className=" min-w-[40px] font-pixel"
                                                style={{
                                                    padding: 0, height: 24, fontSize: 20,
                                                    color: theme.defaultTextColor
                                                }}
                                                value={`${defaultBreakTime}`} onChangeText={handleBreakText}
                                            />
                                            <Text className=" text-xl font-pixel"
                                                  style={{color: theme.defaultTextColor}}>min</Text>
                                            <IonIcons name="chevron-down" size={20} color="#e0aaff"/>
                                        </TouchableOpacity>

                                        {clickSelectBreak && (<>
                                                <Pressable
                                                    onPress={() => setClickSelectBreak(false)}
                                                    style={{
                                                        position: 'absolute',
                                                        /* Prend tout l'écran*/
                                                        top: -1000, bottom: -1000, left: -1000, right: -1000, zIndex: 1,
                                                    }}/>
                                                <View
                                                    style={[cardBg, {
                                                        position: 'absolute', top: 40, right: -2,
                                                        width: 120, borderRadius: 12, padding: 5, zIndex: 2,
                                                    }]}>
                                                    {["5", "10", "15", "20", "25", "30"].map((m) => (
                                                        <TouchableOpacity
                                                            key={m}
                                                            onPress={() => clickBreakTime(m)}
                                                            className="rounded-lg py-2 items-center"
                                                            style={{
                                                                backgroundColor: defaultBreakTime === m ? theme.buttonColor : theme.contentWrapperBgColor,
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            <Text
                                                                className={
                                                                    "font-pixel"
                                                                }
                                                                style={{color: defaultBreakTime === m ? theme.anotherTextColor : theme.defaultTextColor}}
                                                            >
                                                                {m} min
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>
                                {/* -------------- Fin Selection -------------- */}


                                {/* -------------- Selection du nombre de cycles -------------- */}
                                <View className="mb-4">
                                    <Text className=" mb-2 text-xl font-pixel"
                                          style={{color: theme.defaultTextColor}}>Répétitions</Text>
                                    <View className="flex-row gap-2">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Pressable
                                                key={n}
                                                onPress={() => clickRepeat(n)}
                                                className="flex-1 py-2 rounded-xl items-center"
                                                style={{
                                                    backgroundColor: defaultRepetition === n ? theme.buttonColor : theme.contentWrapperBgColor,
                                                }}
                                            >
                                                <Text
                                                    className={
                                                        "font-pixel"
                                                    }
                                                    style={{color: defaultRepetition === n ? theme.anotherTextColor : theme.defaultTextColor}}
                                                >
                                                    {n}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                {/* -------------- Fin Selection -------------- */}

                                {/* -------------- Boutons OK / ANNULER -------------- */}
                                <View className="flex-row justify-center gap-4 mt-6">
                                    <Pressable
                                        onPress={() => {
                                            setClickParam(false);
                                            setNumCycle(defaultRepetition);
                                            setPomodoroDuration(defaultStudyTime);
                                            setBreakDuration(defaultBreakTime);
                                            updateTime(Number(defaultStudyTime));
                                        }}
                                        className="rounded-2xl  py-3 px-8"
                                        style={{backgroundColor: theme.buttonColor}}
                                    >
                                        <Text className=" text-xl font-pixel"
                                              style={{color: theme.defaultTextColor}}>OK</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            setClickParam(false);
                                            setDefaultRepetition(numCycle);
                                            setDefaultStudyTime(pomodoroDuration);
                                            setDefaultBreakTime(breakDuration);
                                        }}
                                        className="rounded-2xl border border-violet-200 py-3 px-8"
                                    >
                                        <Text className=" text-xl font-pixel"
                                              style={{color: theme.defaultTextColor}}>Annuler</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};