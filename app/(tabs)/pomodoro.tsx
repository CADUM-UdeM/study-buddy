import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Audio} from 'expo-av'
import React, {useEffect, useRef, useState} from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import "../global.css";
import {sessionContext} from "@/app/context/SessionContext";
import {darkTheme, lightTheme} from "@/components/colors";
import {TopStatusBarGuard} from "@/components/TopStatusBarGuard";
import {useSettings} from "@/app/context/SettingsContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";


export default function Pomodoro() {

    const key_session = '@sessions_history';
    const {width} = useWindowDimensions();
    const [isRunning, setIsRunning] = useState(false);
    const [hasTimerBeenStarted, setHasTimerBeenStarted] = useState(false);
    const button_start_text = isRunning ? "Pause" : "Débuter";
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

    const [defaultRepetition, setDefaultRepetition] = useState(2)
    const [defaultStudyTime, setDefaultStudyTime] = useState('30')
    const [defaultBreakTime, setDefaultBreakTime] = useState('10')
    const [inBreakTime, setInBreakTime] = useState(false)

    {/* Fonction pour formatage du minuteur */ }
    const addZero = (num: number): string => String(num).padStart(2, "0");

    const [initHours, setInitHours] = useState(0)
    const [hours, setHours] = useState(addZero(initHours))
    const [initMin, setInitMin] = useState(30)
    const [min, setMin] = useState(addZero(initMin))
    const [initSec, setInitSec] = useState(0)
    const [sec, setSec] = useState(addZero(initSec))

    const [isTimeLeftNoEnough, setIsTimeLeftNoEnough] = useState(false)

    const [clickParam, setClickParam] = useState(false)
    const [clickSelectStudy, setClickSelectStudy] = useState(false)
    const [clickSelectBreak, setClickSelectBreak] = useState(false)
    const [isFinished, setIsFinished] = useState(false)


    const [numCycle, setNumCycle] = useState(defaultRepetition)
    const [remainingCycle, setRemainingCycle] = useState(defaultRepetition)
    const [breakDuration, setBreakDuration] = useState(defaultBreakTime)
    const [pomodoroDuration, setPomodoroDuration] = useState(defaultStudyTime)

    const start_button = () => {
        setPhaseTotalSeconds(timeLeft);
        setHasTimerBeenStarted(true);
        setIsRunning(true);
    }
    const pause_button = () => {
        setIsRunning(false);
    }

    const stop_button = () => {
        setIsRunning(false);
        if (hasTimerBeenStarted) {
            handleAddSession(pomodoroDuration, breakDuration, String(numCycle), false, false);
            setHasTimerBeenStarted(false);
        }
        setInBreakTime(false);
        setMin(addZero(initMin));
        setHours(addZero(initHours));
        setSec(addZero(initSec));
        setRemainingCycle(numCycle);
    }

    const add_button = () => {
        if (Number(min) < 55) {
            setMin(addZero(Number(min) + 5))
        }
        /* On fixe un maximum de 3 heures et 55 minutes -------------------- */
        else if (Number(hours) < 3) {
            setMin(addZero(Number(0)))
            setHours(addZero(Number(hours) + 1))
        }
    }


    const min_button = () => {

        if (Number(min) >= 5) {
            setMin(addZero(Number(min) - 5))
        } else if (Number(min) > 0 && Number(min) < 5) {
            setMin(addZero(0))
            setSec(addZero(0))
        } else if (Number(hours) > 0) {
            setMin(addZero(Number(55)))
            setHours(addZero(Number(hours) - 1))
        } else if (timeLeft === 0) {
            setIsRunning(false)

        } else {
            setMin(addZero(0))
            setSec(addZero(0))
            setHours(addZero(0))
            setInBreakTime(!inBreakTime)
        }
    }

    const [timeLeft, setTimeLeft] = useState(Number(hours) * 60 * 60 + Number(min) * 60 + Number(sec));
    const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(
        Number(defaultStudyTime) * 60
    );

    {/* Pour tourner le minuteur --------------------*/
    }
    useEffect(() => {
        if (!isRunning) {
            const next = Number(hours) * 60 * 60 + Number(min) * 60 + Number(sec);
            setTimeLeft(next);
            setPhaseTotalSeconds(next);
        }
    }, [hours, isRunning, min, sec]);

    useEffect(() => {
        if (timeLeft > 0 && isRunning) {
            const timer = setInterval(() => {
                setTimeLeft((timeBefore) => timeBefore - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else if (timeLeft === 0 && remainingCycle > 0) {
            if (!inBreakTime) {
                setRemainingCycle(remainingCycle - 1)
                setWasAudioTransition(false)
            }
            setHasTimerBeenStarted(false);
            if (inBreakTime) {
                const next = Number(pomodoroDuration) * 60;
                setTimeLeft(next);
                setPhaseTotalSeconds(next);
            } else {
                const next = Number(breakDuration) * 60;
                setTimeLeft(next);
                setPhaseTotalSeconds(next);
            }

            setInBreakTime(!inBreakTime)
        } else {
            setIsRunning(false);
            if (remainingCycle === 0 && timeLeft === 0 && inBreakTime) {
                setHasTimerBeenStarted(false);
                setIsFinished(true);
                setInBreakTime(false);
            }
        }
    }, [timeLeft, isRunning, inBreakTime])

    useEffect(() => {
        timeLeftFormating(timeLeft)
    }, [timeLeft]);

    const timeLeftFormating =
        (seconds: number) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            seconds = seconds % 60;

            setMin(addZero(minutes))
            setHours(addZero(hours))
            setSec(addZero(Math.floor(seconds)))
            return [hours, minutes, seconds]
        }
    useEffect(() => {
        setRemainingCycle(numCycle)
    }, [numCycle]);


    const handleStudyText = (text: string) => {

        let cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*^)\./g, '')
        cleaned = cleanText(cleaned)
        setDefaultStudyTime(cleaned)
    }
    const cleanText = (cleaned: string) => {
        const pos = cleaned.indexOf('.')

        {/* Évite plusieurs points */
        }
        if (pos > -1) {
            cleaned = cleaned.replace(/[^0-9]/g, '')
            cleaned = cleaned.slice(0, pos) + '.' + cleaned.slice(pos)
        }

        if (cleaned.length < 1) {
            cleaned = '0'
        }
        return cleaned
    }

    const handleBreakText = (text: string) => {
        let cleaned = text.replace(/[^0-9.]/g, '')
        cleaned = cleanText(cleaned)
        setDefaultBreakTime(cleaned)
    }


    {/*  Pour changer les paramètres du pomodoro -------------------- */
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
    const updateTime = (minutes: number) => {
        const newHours = addZero(Number(Math.floor(minutes / 60)))
        setHours(newHours)
        setInitHours(Number(newHours))

        const newSec = Number(minutes * 60 % 60)
        setSec(addZero(Math.floor(newSec)))
        setInitSec(Math.floor(newSec))

        const newMin = addZero(Number(Math.floor(minutes % 60)))
        setMin(newMin)
        setInitMin(Number(newMin))
    };

    {/* Pour l'historique --------------------*/
    }
    interface Session {
        id: string,
        durationSession: string,
        breakSession: string,
        repeatSession: string,
        isCompleted: boolean,
        isDeleteOpen: boolean,
        date : string
    }
    const [sessions, setSessions] = useState<Session[]>([]);
    const handleDeleteSession = (id: string) => {
        setSessions(session => {
            const newSession = session.filter((actual) => actual.id !== id);

            /* Stockage en local */
            AsyncStorage.setItem(key_session, JSON.stringify(newSession)).catch(error =>
                console.log("Erreur :" + error + ".Impossible de sauvegarder l'historique"));

            return newSession;
        });

        setIsModalDeleteOpen(!isModalDeleteOpen)
    }

    const handleAddSession =
        /* Paramètres */
        (durationSession: string, breakSession: string,
         repeatSession: string, isCompleted: boolean,
         isDeleteOpen: boolean) => {

            /* Creation de la nouvelle session */
            setSessions(session => {
                const newSession =
                [...session, {id: Date.now().toString(), durationSession, breakSession, repeatSession, isCompleted, isDeleteOpen,
                    date : new Date().toISOString().split("T")[0]}];

                /* Stockage en local */
                AsyncStorage.setItem(key_session, JSON.stringify(newSession)).catch(error =>
                    console.log("Erreur :" + error + ".Impossible de sauvegarder l'historique"));

                return newSession;
            });
        };

    /* Avant de modifier historique récupère les données enregistrées. */
    useEffect(() => {
            /* Si on a des données, met à jour la variable contenant nos sessions */
        sessionContext.getSessionsAsync().then(setSessions);
    }, []);

    /* Si session pomodoro fini le rajoute dans la liste de l'historique */
    useEffect(() => {
        if (isFinished) {
            handleAddSession(pomodoroDuration, breakDuration, String(numCycle), isFinished, false)
        }
    }, [breakDuration, isFinished, numCycle, pomodoroDuration]);

    {/* Pour tourner le minuteur --------------------*/
    }
    useEffect(() => {
        if (timeLeft <= 300) {
            setIsTimeLeftNoEnough(true)
        } else {
            setIsTimeLeftNoEnough(false)
        }
    }, [timeLeft]);



    const {settings} = useSettings();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    /* Appliquer la couleur du theme */
    const theme = settings.isDarkMode ? darkTheme : lightTheme;
    const cardBg = {backgroundColor: theme.mainWrapperBgColor};
    const guardOpacity = scrollY.interpolate({
        inputRange: [0, 4, 16],
        outputRange: [0, 0.4, 1],
        extrapolate: "clamp",
    });


    /* Logique pour l'audio fin */
    const [wasAudioEnd, setWasAudioEnd] = useState(false);

    /* Pour lancer l'audio */
    useEffect(() => {
        /* Jouer l'audio quand session finie */
        if (!wasAudioEnd && isFinished){
           Audio.Sound.createAsync(require("../../assets/endAudio.m4a"), {shouldPlay : true}
           ).catch((_)=> console.log("erreur dans chargement de l'audio"))

            setWasAudioEnd(true);
        }
    }, [wasAudioEnd, isFinished]);

    /* Logique pour l'audio transition */
    const [wasAudioTransition, setWasAudioTransition] = useState(false);

    /* Pour lancer l'audio */
    useEffect(() => {
        if (!isFinished){
            /* Jouer audio transition focus → pause */
            if (!wasAudioTransition && inBreakTime){
                Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {shouldPlay : true}
                ).catch((_)=> console.log("erreur dans chargement de l'audio"))
                setWasAudioTransition(true);
            }
            /* Jouer audio transition pause → focus */
            else if (!inBreakTime && wasAudioTransition) {
                setWasAudioTransition(false)
                Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {shouldPlay : true}
                ).catch((_)=> console.log("erreur dans chargement de l'audio"))
            }
        }
    }, [inBreakTime, isFinished, wasAudioTransition]);


    return (
        <View style={{flex: 1, backgroundColor: theme.background}}>
        <Animated.ScrollView
            className="flex-1  px-5 pt-20"
            onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: true},
            )}
            scrollIndicatorInsets={{top: insets.top + 8}}
            scrollEventThrottle={16}
            style={{backgroundColor:theme.background,
                marginTop:20
            }}
        >
            {/* --- Timer card (index-style) --- */}
            <View
                className="rounded-2xl p-6 mb-4"
                style={[
                    cardBg,
                    {
                        borderWidth: 1,
                        borderColor: inBreakTime ? theme.buttonColor : theme.borderColor,
                    },
                ]}
            >
                <Text className="text-center text-lg  mb-6 font-pixel text-[20px]" style={{color:theme.defaultTextColor}}>
                    {!inBreakTime ? "Focus" : "Pause"}
                </Text>

                <View className="flex-row items-center justify-center gap-4">
                    <TouchableOpacity
                        onPress={min_button}
                        disabled={isRunning || timeLeft === 0 || isTimeLeftNoEnough}
                        style={styles.time_button}
                    >
                        <IonIcons
                            name="remove-outline"
                            size={32}
                            color={
                                isRunning || timeLeft === 0 || isTimeLeftNoEnough
                                    ? "#6B7280"
                                    : "#e0aaff"
                            }
                        />
                    </TouchableOpacity>

                    <AnimatedCircularProgress
                        size={176}
                        width={8}
                        fill={phaseTotalSeconds > 0 ? (timeLeft / phaseTotalSeconds) * 100 : 100}
                        tintColor={theme.circleColor}
                        backgroundColor={theme.contentWrapperBgColor}
                        rotation={0}
                        lineCap="round"
                    >
                        {() => (
                            <Text className="text-3xl font-pixel " style={{color:theme.defaultTextColor}}>
                                {hours}:{min}:{sec}
                            </Text>
                        )}
                    </AnimatedCircularProgress>

                    <TouchableOpacity
                        onPress={add_button}
                        disabled={isRunning}
                        style={styles.time_button}
                    >
                        <IonIcons
                            name="add-outline"
                            size={32}
                            color={isRunning ? "#6B7280" : "#e0aaff"}
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-center gap-6 mt-5">
                    <TouchableOpacity
                        onPress={() => setClickParam(!clickParam)}
                        disabled={isRunning}
                        className="rounded-full p-2"
                        style={{backgroundColor: !isRunning ? theme.buttonColor : "#6B7280"}}
                    >
                        <IonIcons name="options-outline" size={20} color="#10002b"/>
                    </TouchableOpacity>
                    <View
                        className="rounded-xl px-4 py-2"
                        style={{backgroundColor: "#AB8BFF40"}}
                    >
                        <Text className="text-lg font-semibold font-pixel" style={{color:theme.defaultTextColor}}>
                            Cycle : {remainingCycle}
                        </Text>
                    </View>
                </View>
            </View>

            {/* --- Params modal --- */}
            <Modal transparent visible={clickParam} animationType="fade">
                <Pressable
                    style={[styles.confPage, {backgroundColor: "rgba(0,0,0,0.6)"}]}
                    onPress={() => setClickParam(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View
                            style={[
                                styles.confContainer,
                                {height: "77%", ...cardBg, borderColor: theme.borderColor, borderWidth: 1, backgroundColor:theme.mainWrapperBgColor},
                            ]}
                        >
                            <Text
                                className="text-2xl  font-pixel"
                                style={{paddingTop: 10, paddingBottom: 20, textAlign: "center", color:theme.defaultTextColor}}
                            >
                                Réglez votre pomodoro
                            </Text>

                            <View style={{padding: 10, gap: 20, zIndex:3}}>
                                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2"
                                      style={cardBg}>
                                    <Text className=" font-pixel text-xl" style={{color:theme.defaultTextColor}}
                                          >Temps d&apos;étude</Text>
                                     <View>
                                    <TouchableOpacity
                                        className="flex-row items-center gap-1 rounded-lg px-3 py-2"
                                        style={{backgroundColor: theme.contentWrapperBgColor}}
                                        onPress={() => setClickSelectStudy(!clickSelectStudy)}
                                    >
                                        <TextInput
                                            keyboardType="numeric"
                                            maxLength={4}
                                            className=" min-w-[40px] font-pixel"
                                            style={{padding: 0, height: 24, fontSize:20, color:theme.defaultTextColor}}
                                            value={`${defaultStudyTime}`}
                                            onChangeText={handleStudyText}
                                        />
                                        <Text className=" font-pixel text-xl" style={{color:theme.defaultTextColor}}>min</Text>
                                        <IonIcons name="chevron-down" size={20} color="#e0aaff"/>
                                    </TouchableOpacity>

                                    {clickSelectStudy && (<>
                                          <Pressable
                                             onPress={() => setClickSelectStudy(false)}
                                             style={{
                                             position: 'absolute',
                                             /* Prend tout l'écran*/
                                             top: -1000, bottom: -1000, left: -1000, right: -1000,
                                             zIndex: 1,
                                             }}/>
                                          <View
                                              style={[cardBg,{
                                                  position: 'absolute',
                                                  top: 40,
                                                  right: -2,
                                                  width: 120,
                                                  borderRadius: 12,
                                                  padding: 5,
                                                  zIndex: 2,
                                              }]}>
                                                {["10", "20", "30", "40", "50", "60"].map((m) => (
                                                    <TouchableOpacity
                                                        key={m}
                                                        onPress={() => clickStudyTime(m)}
                                                        className="rounded-lg py-2 items-center"
                                                        style={{
                                                            backgroundColor: defaultStudyTime === m ? theme.buttonColor : theme.contentWrapperBgColor,
                                                            marginBottom:4,
                                                        }}
                                                    >
                                                        <Text
                                                            className={
                                                                "font-pixel"
                                                            }
                                                            style={{color: defaultStudyTime === m ? theme.anotherTextColor : theme.defaultTextColor}}
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
                                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2"
                                      style={cardBg}>
                                    <Text className=" font-pixel text-xl" style={{color:theme.defaultTextColor}}>Temps de pause </Text>
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
                                            style={{padding: 0, height: 24, fontSize:20, color:theme.defaultTextColor}}
                                            value={`${defaultBreakTime}`}
                                            onChangeText={handleBreakText}
                                        />
                                        <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>min</Text>
                                        <IonIcons name="chevron-down" size={20} color="#e0aaff"/>
                                    </TouchableOpacity>

                                    {clickSelectBreak && (<>
                                    <Pressable
                                        onPress={() => setClickSelectBreak(false)}
                                        style={{
                                            position: 'absolute',
                                            /* Prend tout l'écran*/
                                            top: -1000, bottom: -1000, left: -1000, right: -1000,
                                            zIndex: 1,
                                        }}/>
                                    <View
                                        style={[cardBg,{
                                            position: 'absolute',
                                            top: 40,
                                            right: -2,
                                            width: 120,
                                            borderRadius: 12,
                                            padding: 5,
                                            zIndex: 2,
                                        }]}>
                                                {["5", "10", "15", "20", "25", "30"].map((m) => (
                                                    <TouchableOpacity
                                                        key={m}
                                                        onPress={() => clickBreakTime(m)}
                                                        className="rounded-lg py-2 items-center"
                                                        style={{
                                                            backgroundColor: defaultBreakTime === m ? theme.buttonColor : theme.contentWrapperBgColor,
                                                            marginBottom:4,
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

                                <View className="mb-4">
                                    <Text className=" mb-2 text-xl font-pixel" style={{color:theme.defaultTextColor}}>Répétitions</Text>
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

                                <View className="flex-row justify-center gap-4 mt-6">
                                    <Pressable
                                        onPress={() => {
                                            setClickParam(false);
                                            setNumCycle(defaultRepetition);
                                            setPomodoroDuration(defaultStudyTime);
                                            setBreakDuration(defaultBreakTime);
                                            updateTime(Number(defaultStudyTime));
                                        }}
                                        className="rounded-2xl  py-3 px-8" style={{backgroundColor:theme.buttonColor}}
                                    >
                                        <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>OK</Text>
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
                                        <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>Annuler</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- Info row (index-style card) --- */}
            <View
                className="rounded-2xl flex-row items-center justify-center gap-4 py-4 mb-4"
                style={cardBg}
            >
                <IonIcons name="time-outline" size={22} color="#e0aaff"/>
                <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>{pomodoroDuration} min</Text>
                <IonIcons name="cafe-outline" size={22} color="#e0aaff"/>
                <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>{breakDuration} min</Text>
                <IonIcons name="refresh-outline" size={22} color="#e0aaff"/>
                <Text className=" text-xl font-pixel" style={{color:theme.defaultTextColor}}>{numCycle}</Text>
            </View>

            {/* --- Actions (index-style buttons) --- */}
            <View className="flex-row gap-3 mb-6">
                <Pressable
                    onPress={isRunning ? pause_button : start_button}
                    disabled={timeLeft === 0}
                    className={`flex-1 rounded-2xl py-4 ${timeLeft === 0 ? "opacity-60" : ""}`}
                    style={{
                        backgroundColor: isRunning ? theme.contentWrapperBgColor : timeLeft === 0 ? "#6B7280" : theme.buttonColor,
                    }}
                >
                    <Text className=" text-center  text-xl font-pixel" style={{color:theme.defaultTextColor}}>{button_start_text}</Text>
                </Pressable>
                <Pressable
                    onPress={stop_button}
                    className="flex-1 rounded-2xl border border-red-300 py-4"
                    style={{borderColor: theme.stopBorderColor}}
                >
                    <Text className="text-red-200 text-center text-xl font-pixel" style={{color:theme.stopColor}}>Stop</Text>
                </Pressable>
            </View>

            {/* --- Historique --- */}
            <Text className="text-2xl  mb-2 mt-2 font-pixel" style={{color:theme.defaultTextColor}}>Historique</Text>
            <View style={{height: 2, backgroundColor: theme.contentWrapperBgColor, width: width * 0.5, marginBottom: 12}}/>
            <Modal transparent visible={isFinished} animationType="fade">
                <View style={[styles.confPage, {backgroundColor: "rgba(0,0,0,0.6)"}]}>
                    <View style={[styles.confContainer, cardBg,  {borderWidth: 1, borderColor: theme.borderColor, }]}>
                        <Text className=" text-center mb-2 text-2xl font-pixel" style={{color:theme.defaultTextColor}}>
                            Bravo pour avoir fini la session de pomodoro !
                        </Text>
                        <IonIcons name="ribbon-outline" size={40} color="#e0aaff"
                                  style={{alignSelf: "center", marginVertical: 8}}/>
                        <Pressable
                            onPress={() => {
                                setIsFinished(false);
                                setWasAudioEnd(false);
                                setWasAudioTransition(false);
                                stop_button();
                            }}
                            className="rounded-2xl  py-3 px-8 mt-2 items-center" style={{backgroundColor:theme.buttonColor}}
                        >
                            <Text className=" font-semibold font-pixel text-2xl" style={{color:theme.defaultTextColor}}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{paddingRight: 20}}
            >
                {sessions.map((session) => (
                    <View
                        key={session.id}
                        className="rounded-xl flex-row items-center py-2.5 px-3 mr-2"
                        style={{...cardBg, borderWidth: 1, borderColor: theme.borderColor, minWidth: 140}}
                    >
                        {session.isCompleted && (
                            <IonIcons
                                name="checkmark-circle"
                                size={18}
                                color="#4BAE4F"
                                style={{marginRight: 8}}
                            />
                        )}
                        <View className="flex-1 min-w-0">
                            <Text className=" text-base font-medium font-pixel" numberOfLines={1} style={{color:theme.defaultTextColor}}>
                                {session.durationSession}min · {session.breakSession}min pause ·
                                ×{session.repeatSession}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleDeleteSession(session.id)}
                            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                            className="rounded-full p-1.5 ml-1"
                            style={{backgroundColor: theme.contentWrapperBgColor}}
                        >
                            <IonIcons name="trash-outline" size={14} color={theme===lightTheme? '#DC9EFF' : '#e0aaff'}/>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View className="h-10"/>
        </Animated.ScrollView>
        <TopStatusBarGuard backgroundColor={theme.background} opacity={guardOpacity}/>
        </View>
    );
}

const styles = StyleSheet.create({
    time_button: {
        transform: [{scale: 1.2}]
    },
    confContainer: {
        borderRadius: 20,
        padding: 20,
        width: '85%',
    },
    confPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
