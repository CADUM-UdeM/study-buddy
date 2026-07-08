import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAudioModeAsync, useAudioPlayer} from 'expo-audio'
import React, {useEffect, useRef, useState} from "react";
import {
    Animated, AppState, Modal, Pressable, StyleSheet,
    Text, useWindowDimensions, View
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
import {manageNotif, startNotif, stopNotif} from "@/components/TimerNotification";
import {LinearGradient} from "expo-linear-gradient";

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
            } else setTimeOutsideApps(0);

            //setTimeOutsideApps(0);
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
        if (timeLeft > 0 && isRunning) {
            manageNotif(timeLeft, remainingCycle, inBreakTime, isFinished,
                Number(pomodoroDuration) * 60, Number(breakDuration) * 60);
        } else stopNotif().catch(err => console.log(err));
    }, [isRunning]);


    useEffect(() => {
        const appState = AppState.addEventListener('change', (nextAppState) => {
            /* Si changement d'etat (ferme l'apps et réouvre) */
            if (nextAppState === 'active' && isRunning && endTimeRef.current) {
                const now = Date.now();
                let secLeft = Math.round((endTimeRef.current - now) / 1000);
                setTimeOutsideApps(0);

                if (secLeft <= 0) {
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

    {/* --- Audio quand sur application --- */
    }
    setAudioModeAsync({
        playsInSilentMode: true,
    }).catch((e) => console.log(e));

    const end_audio = useAudioPlayer(require("../../assets/endAudio.m4a"));
    const middle_audio = useAudioPlayer(require("../../assets/switchAudio.mp3"));

    /* Logique pour l'audio fin */
    useEffect(() => {
        /* Jouer l'audio quand session finie */
        if (!wasAudioEnd && isFinished) {
            if (end_audio.currentTime > 0) {
                end_audio.seekTo(0).catch((e) => console.log(e));
            }
            end_audio.play();
            setWasAudioEnd(true);
        }
    }, [wasAudioEnd, isFinished, end_audio]);

    /* Logique pour l'audio transition */
    useEffect(() => {
        if (!isFinished) {
            /* Jouer audio transition focus → pause */
            if (!wasAudioTransition && inBreakTime) {
                if (middle_audio.currentTime > 0) {
                    middle_audio.seekTo(0).catch((e) => console.log(e));
                }
                middle_audio.play();

                setWasAudioTransition(true);
            }
            /* Jouer audio transition pause → focus */
            else if (!inBreakTime && wasAudioTransition) {
                setWasAudioTransition(false)
                if (middle_audio.currentTime > 0) {
                    middle_audio.seekTo(0).catch((e) => console.log(e));
                }
                middle_audio.play();
            }
        }
    }, [inBreakTime, isFinished, wasAudioTransition, middle_audio]);


    { /* -------------- Code pour visualiser la page -------------- */
    }
    return (
        <View style={{flex: 1, backgroundColor: theme.background}}>
            <LinearGradient
                colors={theme === lightTheme ?[theme.gradientOne, theme.gradientTwo, theme.gradientThree] : [theme.gradientOne, theme.gradientTwo, theme.gradientThree]}
                locations={[0, 0.4, 1]}
                style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
            />
            <Animated.ScrollView className="flex-1  px-5 pt-20"
                                 onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true},)}
                                 scrollIndicatorInsets={{top: insets.top + 8}} scrollEventThrottle={16}
                                 style={{ marginTop: 20}}>

                {/* Section timer pomodoro */}
                <View className="rounded-2xl p-6 mb-4"
                      style={{
                          backgroundColor: inBreakTime ? `${theme.borderColor}E6` : `${theme.mainWrapperBgColor}E6`,
                          borderWidth: 1, borderColor: inBreakTime ? theme.circleColor : theme.borderColor,
                          borderRadius:90
                      }}>
                    {/* --- Timer card (index-style) --- */}
                    <TimerClock inBreakTime={inBreakTime} phaseTotalSeconds={phaseTotalSeconds} timeLeft={timeLeft}
                                hours={hours} min={min} sec={sec} isRunning={isRunning} setClickParam={setClickParam}
                                clickParam={clickParam} remainingCycle={remainingCycle} numCycle={numCycle}/>

                    {/* --- Params modal --- */}
                    <TimerParams clickParam={clickParam} setClickParam={setClickParam} setNumCycle={setNumCycle}
                                 setPomodoroDuration={setPomodoroDuration} setBreakDuration={setBreakDuration}
                                 numCycle={numCycle} pomodoroDuration={pomodoroDuration} breakDuration={breakDuration}
                                 updateTime={updateTime}/>


                    {/* --- Info row (index-style card) --- */}
                    <TimerInfoRow pomodoroDuration={pomodoroDuration} breakDuration={breakDuration}
                                  numCycle={numCycle}/>
                </View>

                {/* --- Actions (index-style buttons) --- */}
                <View className="flex-row gap-3 mb-6 px-8 mt-6">
                    {/* --- Bouton débuter --- */}
                    <Pressable
                        onPress={isRunning ? pause_button : start_button}
                        disabled={timeLeft === 0}
                        className={`rounded-2xl py-4 ${timeLeft === 0 ? "opacity-60" : ""}`}
                        style={{
                            backgroundColor: isRunning ? theme.contentWrapperBgColor : timeLeft === 0 ? "#6B7280" :
                                theme.buttonColor, width:'40%'
                        }}
                    >
                        <Text className=" text-center  text-xl font-pixel"
                              style={{color: theme.buttonTextColor}}>{button_start_text}</Text>
                    </Pressable>

                    {/* --- Bouton stop --- */}
                    <Pressable
                        onPress={stop_button}
                        className="rounded-2xl border border-red-300 py-4"
                        style={{borderColor: theme.stopBorderColor, width:'40%'}}
                    >
                        <Text className="text-red-200 text-center text-xl font-pixel"
                              style={{color: theme.stopColor}}>Stop</Text>
                    </Pressable>

                    {/* --- Bouton Param --- */}
                    <Pressable
                        onPress={() => setClickParam(!clickParam)}
                        disabled={isRunning}
                        className={`flex-[2] justify-center items-center rounded-full p-2 ${isRunning ? "opacity-60" : ""}`}
                        style={{ backgroundColor: !isRunning ? theme.buttonColor : "#6B7280", width:'15%' }}
                    >

                        <IonIcons name="options-outline" size={20} color={theme.buttonTextColor}/>
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