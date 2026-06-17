import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Audio} from 'expo-av'
import React, {useEffect, useRef, useState} from "react";
import {
    Animated, AppState, Modal, Pressable, ScrollView, StyleSheet,
    Text, TouchableOpacity, useWindowDimensions, View
} from "react-native";
import "../global.css";
import {sessionContext} from "@/app/context/SessionContext";
import {darkTheme, lightTheme} from "@/components/colors";
import {TopStatusBarGuard} from "@/components/TopStatusBarGuard";
import {useSettings} from "@/app/context/SettingsContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {TimerInfoRow} from "@/components/TimerInfoRow";
import {TimerClock} from "@/components/TimerClock";
import {DEFAULT_BREAK_TIME, DEFAULT_REPETITION, DEFAULT_STUDY_TIME, TimerParams} from "@/components/TimerParams";

export default function Pomodoro() {

    { /* Fonction pour formatage du minuteur */
    }
    const addZero = (num: number): string => String(num).padStart(2, "0");

    { /* -------------- Constantes -------------- */
    }
    const key_session = '@sessions_history';
    const {width} = useWindowDimensions();
    const [isRunning, setIsRunning] = useState(false);
    const [hasTimerBeenStarted, setHasTimerBeenStarted] = useState(false);
    const button_start_text = isRunning ? "Pause" : "Débuter";
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [inBreakTime, setInBreakTime] = useState(false)
    const [initHours, setInitHours] = useState(0)
    const [hours, setHours] = useState(addZero(initHours))
    const [initMin, setInitMin] = useState(30)
    const [min, setMin] = useState(addZero(initMin))
    const [initSec, setInitSec] = useState(0)
    const [sec, setSec] = useState(addZero(initSec))
    const [clickParam, setClickParam] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [numCycle, setNumCycle] = useState(DEFAULT_REPETITION)
    const [remainingCycle, setRemainingCycle] = useState(DEFAULT_REPETITION)
    const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_TIME)
    const [pomodoroDuration, setPomodoroDuration] = useState(DEFAULT_STUDY_TIME)
    const [timeLeft, setTimeLeft] = useState(Number(hours) * 60 * 60 + Number(min) * 60 + Number(sec));
    const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(Number(DEFAULT_STUDY_TIME) * 60);
    const [wasAudioTransition, setWasAudioTransition] = useState(false);
    const [wasAudioEnd, setWasAudioEnd] = useState(false);
    const endTimeRef = useRef<number | null>(null);
    const [wasUpdated, setWasUpdated] = useState(false);
    const [hasClickedBreak, setHasClickedBreak] = useState(false);
    const [timeOutsideApps, setTimeOutsideApps] = useState(0);

    { /* -------------- Fonctions -------------- */
    }
    const start_button = () => {
        setPhaseTotalSeconds(timeLeft);
        setHasTimerBeenStarted(true);
        setIsRunning(true);
    }
    const pause_button = () => {
        setIsRunning(false);
        setHasClickedBreak(true);
    }

    const stop_button = () => {
        setIsRunning(false);
        setHasClickedBreak(false);
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
        /* Si chrono tourne */
        if (timeLeft > 0 && isRunning) {
            setTimeOutsideApps(0);
            if (!endTimeRef.current || wasUpdated) endTimeRef.current = Date.now() + timeLeft * 1000;
            setWasUpdated(false);
            const timer = setInterval(() => {
                setTimeLeft((timeBefore) => timeBefore - 1)
            }, 1000)
            return () => {
                clearInterval(timer)
                if (!isRunning && !hasClickedBreak) endTimeRef.current = null;
            }
        }
        /* Si on change de transition pause/focus */
        else if (timeLeft === 0 && remainingCycle > 0) {
            endTimeRef.current = null;
            /* En mode focus */
            if (!inBreakTime) {
                setRemainingCycle(remainingCycle - 1)
                setWasAudioTransition(false)
            }
            setHasTimerBeenStarted(false);

            let next;
            /* En mode pause */
            if (inBreakTime) next = Number(pomodoroDuration) * 60 - timeOutsideApps;
            else next = Number(breakDuration) * 60 - timeOutsideApps;

            /* Met à jour le temps sur le prochain état */
            if (next <= 0) {
                setTimeOutsideApps(Math.abs(next));
                next = 0
            }
            else setTimeOutsideApps(0);

            setTimeOutsideApps(0);
            setTimeLeft(next);
            setPhaseTotalSeconds(next);
            setInBreakTime(!inBreakTime);
        } /* Si on a fini totalement le pomodoro */
        else {
            setIsRunning(false);
            if (remainingCycle === 0 && timeLeft === 0 && inBreakTime) {
                setHasTimerBeenStarted(false);
                setIsFinished(true);
                setTimeOutsideApps(0);
                setInBreakTime(false);
                endTimeRef.current = null;
            }
        }
    }, [timeLeft, isRunning, inBreakTime])

    useEffect(() => {
        const appState = AppState.addEventListener('change', (nextAppState) => {
            /* Si changement d'etat (ferme l'apps et réouvre) */
            if (nextAppState === 'active' && isRunning && endTimeRef.current) {
                const now = Date.now();
                let secLeft = Math.round((endTimeRef.current - now) / 1000);
                setTimeOutsideApps(0);

                if (secLeft <= 0) {
                    /* Passer à prochain état (en cours) */
                    /* Pour le moment juste passer au début de l'autre état */
                    setTimeLeft(0);
                    setTimeOutsideApps(Math.abs(secLeft));
                } else setTimeLeft(secLeft);
            }
        });
        return () => appState.remove();
    }, [isRunning]);

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

    { /*  Pour changer les paramètres du pomodoro -------------------- */
    }
    const updateTime = (minutes: number) => {
        setWasUpdated(true)
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
        date: string
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
                    [...session, {
                        id: Date.now().toString(),
                        durationSession,
                        breakSession,
                        repeatSession,
                        isCompleted,
                        isDeleteOpen,
                        date: new Date().toISOString().split("T")[0]
                    }];

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
    useEffect(() => {
        /* Jouer l'audio quand session finie */
        if (!wasAudioEnd && isFinished) {
            Audio.Sound.createAsync(require("../../assets/endAudio.m4a"), {shouldPlay: true}
            ).catch((_) => console.log("erreur dans chargement de l'audio"))
            setWasAudioEnd(true);
        }
    }, [wasAudioEnd, isFinished]);

    /* Logique pour l'audio transition */
    useEffect(() => {
        if (!isFinished) {
            /* Jouer audio transition focus → pause */
            if (!wasAudioTransition && inBreakTime) {
                Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {shouldPlay: true}
                ).catch((_) => console.log("erreur dans chargement de l'audio"))
                setWasAudioTransition(true);
            }
            /* Jouer audio transition pause → focus */
            else if (!inBreakTime && wasAudioTransition) {
                setWasAudioTransition(false)
                Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {shouldPlay: true}
                ).catch((_) => console.log("erreur dans chargement de l'audio"))
            }
        }
    }, [inBreakTime, isFinished, wasAudioTransition]);


    { /* -------------- Code pour visualiser la page -------------- */
    }
    return (
        <View style={{flex: 1, backgroundColor: theme.background}}>
            <Animated.ScrollView className="flex-1  px-5 pt-20"
                                 onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true},)}
                                 scrollIndicatorInsets={{top: insets.top + 8}} scrollEventThrottle={16}
                                 style={{backgroundColor: theme.background, marginTop: 20}}>

                {/* --- Timer card (index-style) --- */}
                <TimerClock inBreakTime={inBreakTime} phaseTotalSeconds={phaseTotalSeconds} timeLeft={timeLeft}
                            hours={hours} min={min} sec={sec} isRunning={isRunning} setClickParam={setClickParam}
                            clickParam={clickParam} remainingCycle={remainingCycle}/>

                {/* --- Params modal --- */}
                <TimerParams clickParam={clickParam} setClickParam={setClickParam} setNumCycle={setNumCycle}
                             setPomodoroDuration={setPomodoroDuration} setBreakDuration={setBreakDuration}
                             numCycle={numCycle} pomodoroDuration={pomodoroDuration} breakDuration={breakDuration}
                             updateTime={updateTime}/>

                {/* --- Info row (index-style card) --- */}
                <TimerInfoRow pomodoroDuration={pomodoroDuration} breakDuration={breakDuration} numCycle={numCycle}/>

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
                        <Text className=" text-center  text-xl font-pixel"
                              style={{color: theme.defaultTextColor}}>{button_start_text}</Text>
                    </Pressable>
                    <Pressable
                        onPress={stop_button}
                        className="flex-1 rounded-2xl border border-red-300 py-4"
                        style={{borderColor: theme.stopBorderColor}}
                    >
                        <Text className="text-red-200 text-center text-xl font-pixel"
                              style={{color: theme.stopColor}}>Stop</Text>
                    </Pressable>
                </View>

                {/* --- Message de fin de session pomodoro --- */}
                <Modal transparent visible={isFinished} animationType="fade">
                    <View style={[styles.confPage, {backgroundColor: "rgba(0,0,0,0.6)"}]}>
                        <View style={[styles.confContainer, cardBg, {borderWidth: 1, borderColor: theme.borderColor,}]}>
                            <Text className=" text-center mb-2 text-2xl font-pixel"
                                  style={{color: theme.defaultTextColor}}>
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
                                className="rounded-2xl  py-3 px-8 mt-2 items-center"
                                style={{backgroundColor: theme.buttonColor}}
                            >
                                <Text className=" font-semibold font-pixel text-2xl"
                                      style={{color: theme.defaultTextColor}}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* --- Historique --- */}
                <Text className="text-2xl  mb-2 mt-2 font-pixel"
                      style={{color: theme.defaultTextColor}}>Historique</Text>
                <View style={{
                    height: 2,
                    backgroundColor: theme.contentWrapperBgColor,
                    width: width * 0.5,
                    marginBottom: 12
                }}/>
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
                                <Text className=" text-base font-medium font-pixel" numberOfLines={1}
                                      style={{color: theme.defaultTextColor}}>
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
                                <IonIcons name="trash-outline" size={14}
                                          color={theme === lightTheme ? '#DC9EFF' : '#e0aaff'}/>
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