import IonIcons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
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
import { AnimatedCircularProgress } from "react-native-circular-progress";
import "../global.css";


export default function Pomodoro() {


const { width } = useWindowDimensions();
const [isRunning, setIsRunning] = useState(false);
const [hasTimerBeenStarted, setHasTimerBeenStarted] = useState(false);
const button_start_text = isRunning ? "Pause" : "Débuter";
const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

const [defaultRepetition, setDefaultRepetition] = useState(2)
const [defaultStudyTime, setDefaultStudyTime] = useState('30')
const [defaultBreakTime, setDefaultBreakTime] = useState('10')
const [inBreakTime, setInBreakTime] = useState(false)

{/* Fonction pour formatage du minuteur */}
const addZero = (num : number): string => { 
  if (num < 10) {
    return `0${num}`
  } 
  else {
      return `${num}` 
    }};


const [initHours, setInitHours] = useState(0)
const [hours, setHours] = useState(addZero(initHours))
const [initMin, setInitMin] = useState(30)
const [min, setMin] = useState(addZero(initMin))
const [initSec, setInitSec] = useState(0)
const [sec, setSec] = useState(addZero(initSec))

const [isTimeLeftNoEnought, setIsTimeLeftNoEnought] = useState(false)

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
        handleAddHistory(pomodoroDuration, breakDuration, String(numCycle), false, false);
        setHasTimerBeenStarted(false);
      }
      setMin(addZero(initMin));
      setHours(addZero(initHours));
      setSec(addZero(initSec));
      setRemainingCycle(numCycle);
}

const add_button = () => {
    if (Number(min) < 55){
        setMin(addZero(Number(min) + 5))}
    /* On fixe un maximum de 3 heures et 55 minutes -------------------- */
    else if (Number(hours) < 3){
        setMin(addZero(Number(0)))
        setHours(addZero(Number(hours) +1))
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
    } else if (timeLeft == 0) {
        setIsRunning(false)

    }
    else {
        setMin(addZero(0))
        setSec(addZero(0))
        setHours(addZero(0))
        setInBreakTime(!inBreakTime)
    }
}

const [timeLeft, setTimeLeft] = useState(Number(hours)*60*60 + Number(min) *60+ Number(sec));
const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(
  Number(defaultStudyTime) * 60
);

{/* Pour tourner le minuteur --------------------*/}
useEffect(() => {
        if(!isRunning) {
            const next = Number(hours)*60*60 + Number(min) *60+ Number(sec);
            setTimeLeft(next);
            setPhaseTotalSeconds(next);
        }
    }, [hours, min, sec]);

useEffect(() => {
    if (timeLeft>0 && isRunning) {
    const timer = setInterval(() => {
        setTimeLeft((timeBefore) => timeBefore - 1)
    }, 1000)
    return () => clearInterval(timer)
    }
    else if (timeLeft === 0 && remainingCycle > 0){
        if(!inBreakTime){
            setRemainingCycle(remainingCycle - 1)
        }
        setHasTimerBeenStarted(false);
        if(inBreakTime){
            const next = Number(pomodoroDuration)*60;
            setTimeLeft(next);
            setPhaseTotalSeconds(next);
        }
        else {
            const next = Number(breakDuration)*60;
            setTimeLeft(next);
            setPhaseTotalSeconds(next);
        }

        setInBreakTime(!inBreakTime)
    }

    else {
        setIsRunning(false);
        if (remainingCycle === 0 && timeLeft === 0) {
          setHasTimerBeenStarted(false);
          setIsFinished(true);
        }
    }
}, [timeLeft, isRunning])

useEffect(() => {
    timeLeftFormating(timeLeft)
    }, [timeLeft]);

const timeLeftFormating =
    (seconds: number)=> {
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


const handleStudyText = (text : string)=> {

    let cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*^)\./g, '')
    cleaned = cleanText(cleaned)
    setDefaultStudyTime(cleaned)
}
const cleanText = (cleaned: string)=> {
    const pos = cleaned.indexOf('.')

    {/* Évite plusieurs points */}
    if (pos > -1) {
        cleaned = cleaned.replace(/[^0-9]/g, '')
        cleaned = cleaned.slice(0, pos) + '.' + cleaned.slice(pos)
    }

    if (cleaned.length< 1) {
        cleaned = '0'
    }
    return cleaned
}
const handleDeleteSession = (id : String) =>{
    setSessions(session=> session.filter((actual) => actual.id !== id))
    setIsModalDeleteOpen(!isModalDeleteOpen)
}
const handleBreakText = (text : string)=> {
    let cleaned = text.replace(/[^0-9.]/g, '')
    cleaned = cleanText(cleaned)
    setDefaultBreakTime(cleaned)
}


{/*  Pour changer les paramètres du pomodoro -------------------- */}

const clickRepeat = (index : number) => {
    setDefaultRepetition(index)
}
const clickStudyTime = (index : string) => {
        setDefaultStudyTime(index)
}
const clickBreakTime = (index : string) => {
        setDefaultBreakTime(index)
}
const updateTime = (minutes : number) => {
        const newHours = addZero(Number(Math.floor(minutes/ 60)))
        setHours(newHours)
        setInitHours(Number(newHours))

        const newSec = Number(minutes*60%60)
        setSec(addZero(Math.floor( newSec)))
        setInitSec(Math.floor(newSec))

        const newMin = addZero(Number(Math.floor(minutes% 60)))
        setMin(newMin)
        setInitMin(Number(newMin))
};

{/* Pour l'historique --------------------*/}
const [sessions, setSessions] = useState<{id:string,
                                          durationSession:string,
                                          breakSession:string,
                                          repeatSession:string,
                                          isCompleted:boolean,
                                          isDeleteOpen:boolean}[]>([]);

const handleAddHistory = (
durationSession:string, breakSession:string, repeatSession:string, isCompleted : boolean, isDeleteOpen:boolean) => {
    setSessions(session => [... session, {id:Date.now().toString(),
    durationSession:durationSession, breakSession:breakSession, repeatSession:repeatSession, isCompleted:isCompleted,
    isDeleteOpen:isDeleteOpen}])
};

useEffect(() => {
    if (isFinished){
    handleAddHistory(pomodoroDuration, breakDuration, String(numCycle), isFinished, false)
    }
    }, [isFinished]);

const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

{/* Pour tourner le minuteur --------------------*/}
useEffect(() => {
        if(timeLeft <= 300) {
            setIsTimeLeftNoEnought(true)
        }
        else {
            setIsTimeLeftNoEnought(false)
        }
    }, [timeLeft]);


  const cardBg = { backgroundColor: "#1A1729" };

  return (
    <ScrollView className="flex-1 bg-dark-primary px-5 pt-16">
      {/* --- Timer card (index-style) --- */}
      <View
        className="rounded-2xl p-6 mb-4"
        style={[
          cardBg,
          {
            borderWidth: 1,
            borderColor: inBreakTime ? "#7b2cbf" : "#444462",
          },
        ]}
      >
        <Text className="text-center text-lg font-bold text-purple-200 mb-6">
          {!inBreakTime ? "Focus" : "Pause"}
        </Text>

        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            onPress={min_button}
            disabled={isRunning || timeLeft === 0 || isTimeLeftNoEnought}
            style={styles.time_button}
          >
            <IonIcons
              name="remove-outline"
              size={32}
              color={
                isRunning || timeLeft === 0 || isTimeLeftNoEnought
                  ? "#6B7280"
                  : "#e0aaff"
              }
            />
          </TouchableOpacity>

          <AnimatedCircularProgress
            size={176}
            width={8}
            fill={phaseTotalSeconds > 0 ? (timeLeft / phaseTotalSeconds) * 100 : 100}
            tintColor="#AB8BFF"
            backgroundColor="#444462"
            rotation={0}
            lineCap="round"
          >
            {() => (
              <Text className="text-3xl font-bold text-purple-100">
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
            style={{ backgroundColor: !isRunning ? "#AB8BFF" : "#6B7280" }}
          >
            <IonIcons name="options-outline" size={20} color="#10002b" />
          </TouchableOpacity>
          <View
            className="rounded-xl px-4 py-2"
            style={{ backgroundColor: "#AB8BFF40" }}
          >
            <Text className="text-sm font-semibold text-purple-100">
              Cycle : {remainingCycle}
            </Text>
          </View>
        </View>
      </View>

      {/* --- Params modal --- */}
      <Modal transparent visible={clickParam} animationType="fade">
        <Pressable
          style={[stylesProfil.confPage, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          onPress={() => setClickParam(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                stylesProfil.confContener,
                { height: "70%", ...cardBg, borderColor: "#444462", borderWidth: 1 },
              ]}
            >
              <Text
                className="text-lg font-bold text-purple-100"
                style={{ paddingTop: 10, paddingBottom: 20, textAlign: "center" }}
              >
                Réglez votre pomodoro
              </Text>

              <View style={{ padding: 10, gap: 20 }}>
                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2" style={cardBg}>
                  <Text className="text-purple-100">Temps d'étude</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#444462" }}
                    onPress={() => setClickSelectStudy(true)}
                  >
                    <TextInput
                      keyboardType="numeric"
                      maxLength={4}
                      className="text-purple-100 min-w-[40px]"
                      style={{ padding: 0, height: 24 }}
                      value={`${defaultStudyTime}`}
                      onChangeText={handleStudyText}
                    />
                    <Text className="text-purple-200">min</Text>
                    <IonIcons name="chevron-down" size={20} color="#e0aaff" />
                  </TouchableOpacity>
                </View>

                <Modal transparent visible={clickSelectStudy} animationType="fade">
                  <Pressable
                    style={[stylesProfil.confPage, { flex: 1 }]}
                    onPress={() => setClickSelectStudy(false)}
                  >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                      <View
                        className="rounded-2xl p-3 gap-1 w-32"
                        style={cardBg}
                      >
                        {["10", "20", "30", "40", "50", "60"].map((m) => (
                          <TouchableOpacity
                            key={m}
                            onPress={() => clickStudyTime(m)}
                            className="rounded-lg py-2 items-center"
                            style={{
                              backgroundColor: defaultStudyTime === m ? "#7b2cbf" : "#444462",
                            }}
                          >
                            <Text
                              className={
                                defaultStudyTime === m ? "text-white font-semibold" : "text-purple-200"
                              }
                            >
                              {m} min
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </Pressable>
                  </Pressable>
                </Modal>

                <View className="flex-row items-center justify-between rounded-xl py-3 px-4 mb-2" style={cardBg}>
                  <Text className="text-purple-100">Temps de pause</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#444462" }}
                    onPress={() => setClickSelectBreak(true)}
                  >
                    <TextInput
                      keyboardType="numeric"
                      maxLength={4}
                      className="text-purple-100 min-w-[40px]"
                      style={{ padding: 0, height: 24 }}
                      value={`${defaultBreakTime}`}
                      onChangeText={handleBreakText}
                    />
                    <Text className="text-purple-200">min</Text>
                    <IonIcons name="chevron-down" size={20} color="#e0aaff" />
                  </TouchableOpacity>
                </View>
                <Modal transparent visible={clickSelectBreak} animationType="fade">
                  <Pressable
                    style={[stylesProfil.confPage, { flex: 1 }]}
                    onPress={() => setClickSelectBreak(false)}
                  >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                      <View className="rounded-2xl p-3 gap-1 w-32" style={cardBg}>
                        {["5", "10", "15", "20", "25", "30"].map((m) => (
                          <TouchableOpacity
                            key={m}
                            onPress={() => clickBreakTime(m)}
                            className="rounded-lg py-2 items-center"
                            style={{
                              backgroundColor: defaultBreakTime === m ? "#7b2cbf" : "#444462",
                            }}
                          >
                            <Text
                              className={
                                defaultBreakTime === m ? "text-white font-semibold" : "text-purple-200"
                              }
                            >
                              {m} min
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </Pressable>
                  </Pressable>
                </Modal>

                <View className="mb-4">
                  <Text className="text-purple-100 mb-2">Répétitions</Text>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => clickRepeat(n)}
                        className="flex-1 py-2 rounded-xl items-center"
                        style={{
                          backgroundColor: defaultRepetition === n ? "#7b2cbf" : "#444462",
                        }}
                      >
                        <Text
                          className={
                            defaultRepetition === n ? "text-white font-semibold" : "text-purple-200"
                          }
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
                    className="rounded-2xl bg-violet-600 py-3 px-8"
                  >
                    <Text className="text-purple-100 font-semibold">OK</Text>
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
                    <Text className="text-purple-100 font-semibold">Annuler</Text>
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
        <IonIcons name="time-outline" size={22} color="#e0aaff" />
        <Text className="text-purple-100 font-semibold">{pomodoroDuration} min</Text>
        <IonIcons name="cafe-outline" size={22} color="#e0aaff" />
        <Text className="text-purple-100 font-semibold">{breakDuration} min</Text>
        <IonIcons name="refresh-outline" size={22} color="#e0aaff" />
        <Text className="text-purple-100 font-semibold">{numCycle}</Text>
      </View>

      {/* --- Actions (index-style buttons) --- */}
      <View className="flex-row gap-3 mb-6">
        <Pressable
          onPress={isRunning ? pause_button : start_button}
          disabled={timeLeft === 0}
          className={`flex-1 rounded-2xl py-4 ${timeLeft === 0 ? "opacity-60" : ""}`}
          style={{
            backgroundColor: isRunning ? "#444462" : timeLeft === 0 ? "#6B7280" : "#7b2cbf",
          }}
        >
          <Text className="text-purple-100 text-center font-semibold">{button_start_text}</Text>
        </Pressable>
        <Pressable
          onPress={stop_button}
          className="flex-1 rounded-2xl border border-red-300 py-4"
          style={{ borderColor: "#f87171" }}
        >
          <Text className="text-red-200 text-center font-semibold">Stop</Text>
        </Pressable>
      </View>

      {/* --- Historique --- */}
      <Text className="text-xl font-bold text-purple-100 mb-2 mt-2">Historique</Text>
      <View style={{ height: 2, backgroundColor: "#444462", width: width * 0.5, marginBottom: 12 }} />
      <Modal transparent visible={isFinished} animationType="fade">
        <View style={[stylesProfil.confPage, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <View style={[stylesProfil.confContener, cardBg, { borderWidth: 1, borderColor: "#444462" }]}>
            <Text className="text-purple-100 text-center font-bold text-lg mb-2">
              Bravo pour avoir fini la session de pomodoro !
            </Text>
            <IonIcons name="ribbon-outline" size={40} color="#e0aaff" style={{ alignSelf: "center", marginVertical: 8 }} />
            <Pressable
              onPress={() => setIsFinished(false)}
              className="rounded-2xl bg-violet-600 py-3 px-8 mt-2"
            >
              <Text className="text-purple-100 font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {sessions.map((session) => (
          <View
            key={session.id}
            className="rounded-xl flex-row items-center py-2.5 px-3 mr-2"
            style={{ ...cardBg, borderWidth: 1, borderColor: "#444462", minWidth: 140 }}
          >
            {session.isCompleted && (
              <IonIcons
                name="checkmark-circle"
                size={18}
                color="#4BAE4F"
                style={{ marginRight: 8 }}
              />
            )}
            <View className="flex-1 min-w-0">
              <Text className="text-purple-100 text-xs font-medium" numberOfLines={1}>
                {session.durationSession}min · {session.breakSession}min pause · ×{session.repeatSession}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteSession(session.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="rounded-full p-1.5 ml-1"
              style={{ backgroundColor: "#444462" }}
            >
              <IonIcons name="trash-outline" size={14} color="#e0aaff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View className="h-10" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    styleText:{
      alignItems:'center',
      marginBottom: 10,
      borderRadius:20,
    },
    bodyStyle:{
      paddingTop: 20,
      padding:30,
      alignItems: "center",
    },
    time_button:{
      transform:[{scale:1.2}]
    },
    setting_button:{
      backgroundColor:"#FFC943",
      width: 40,
      height: 40,
      padding:8,
      borderRadius:50,
      textAlign:'center'
    },
    timer:{
      borderRadius: "100%",
      borderWidth: 2,
      width: 200,
      height: 200,
      alignSelf:'center',
      justifyContent:'center'
    },
    timerSection:{
      borderRadius: 20,
      borderWidth: 2,
    },
    actionButton: {
      alignItems: "center",
      padding: 10,
      margin:10,
      minWidth: 110,
      borderRadius:15,
    },
    infoButton:{

    },
    infoBloc:{
      backgroundColor:'#D9D9D9',
      alignItems: 'center',
      alignSelf:'center',
      justifyContent:'center',
      flexDirection:'row',
      width:'80%',
      height:50,
      gap:5,
      marginTop:40,
      borderRadius:10
    },

    shadow :{
        shadowColor: 'black',
        shadowOpacity:0.1,
        shadowOffset: {
                width: 0,
                height:3,
        },
        elevation: 3   },
    paramContent:{
      backgroundColor:'#D9D9D9',
      height:50,
      borderRadius:25,
      padding:10,
      flexDirection:'row',
    },
    selectRepetition:{
      width:'80%',
      height: 20,
      borderRadius:20,
      alignItems:'center',
      margin:2
    },
    styleToSelectTime:{
      marginTop:-10,
      width:95
    },
    styleSelectTime:{
      width:80,
      height:200, 
      marginLeft:200,
      padding:10, 
      marginTop:-100,
      backgroundColor:'#D9D9D9',
    },
    styleSelectBreak:{
        width:80,
        height:200,
        marginLeft:60,
        padding:10,
        marginTop:40,
        backgroundColor:'#D9D9D9',
    }
});

const stylesProfil = StyleSheet.create({
    confPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confContener: {
        borderRadius: 20,
        padding: 20,
        width: '85%',
    },
    confText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    clickButton: {
        alignItems: 'center',
        padding: 12,
        minWidth: 80,
        borderRadius: 15,
    },
    drawHorLine: {
        height: 2,
    },
});
