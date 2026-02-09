import IonIcons from "@expo/vector-icons/Ionicons";

import React, { useEffect, useState, } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View
} from "react-native";


export default function Pomodoro() {


const {width, height} = useWindowDimensions()
const [isRunning, setIsRunning] = useState(false)
const [isLocked, setIsLocked] = useState(false)
const  button_start_text   = isRunning ? 'Pause' : 'Débuter'
const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';
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
      setIsRunning(true);
}
const pause_button = () => {
      setIsRunning(false);
}

const stop_button = () => {
      setIsRunning(false);
      setMin(addZero(initMin))
      setHours(addZero(initHours))
      setSec(addZero(initSec))
      handleAddHistory(pomodoroDuration, breakDuration, String(numCycle), false, false)

      setRemainingCycle(numCycle)
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

const [timeLeft, setTimeLeft] = useState(Number(hours)*60*60 + Number(min) *60+ Number(sec))

{/* Pour tourner le minuteur --------------------*/}
useEffect(() => {
        if(!isRunning) {
            setTimeLeft(Number(hours)*60*60 + Number(min) *60+ Number(sec))}
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
        if(inBreakTime){
            setTimeLeft(Number(Number(pomodoroDuration)*60))
        }
        else {
            setTimeLeft(Number(breakDuration)*60)
        }

        setInBreakTime(!inBreakTime)
    }

    else {
        setIsRunning(false)
        if (remainingCycle ===0 && timeLeft === 0 ) {
            setIsFinished(true)
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


    return (
    <ScrollView>
    <View style ={styles.bodyStyle}>
        <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyBudy </Text>
            <Text></Text>

        {/* -------------------- Section Minuteur pomodoro  -------------------- */}
        <View style={[styles.timerSection, {borderColor: isDarkMode ? '#4D4D71' : '#B3B3B3',
            backgroundColor:inBreakTime? (isDarkMode ? '#565681': '#D9D9D9') : (isDarkMode ? 'black': '#F4F4F4')}]}>

        <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:20, fontWeight:'bold', 
          textAlign:'center', marginBottom:40, marginTop:20}}> {!inBreakTime ? 'Focus Mode' : 'En pause'} </Text>
        
        {/* -------------------- Partie Minuteur -------------------- */}
        <View style={{flexDirection:'row', alignItems:'center',  justifyContent:'center', gap : "4%", }}>
        
        {/*  Diminue le temps */}
        <TouchableOpacity style={[styles.time_button, ]} onPress={min_button} disabled={isRunning || timeLeft == 0 || isTimeLeftNoEnought }>
        <IonIcons name="remove-outline" size={35} color={isDarkMode ? ((isRunning || timeLeft == 0 || isTimeLeftNoEnought) ? '#959090': '#F2F2F2'):
            ((isRunning || timeLeft == 0|| isTimeLeftNoEnought) ? '#D8D6D6': '#757575')} style={styles.time_button}/>
        </TouchableOpacity>

        {/*  Minuteur */}
        <View style={[styles.timer, {borderColor:"#FFC943"}]}>
        <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:30, alignSelf:'center', fontWeight:'bold'}}> {hours}:{min}:{sec} </Text>
        </View>
        
        {/*  Ajoute du temps */}
        <TouchableOpacity style={[styles.time_button, ]} onPress={add_button} disabled={isRunning}>
        <IonIcons name="add-outline" size={35} color={isDarkMode ? (isRunning ? '#959090': '#F2F2F2') :
            (isRunning ? '#D8D6D6': '#757575')} style={styles.time_button}/>
        </TouchableOpacity>
        </View>

        {/*  Option Minuteur */}
        <View style={{flexDirection:'row', gap:45, marginTop:20 }}>
        <TouchableOpacity onPress={()=> setClickParam(!clickParam)} disabled={isRunning} style={{marginLeft:20}}>
        <IonIcons name="options-outline" size={18} color={'black'} style={[styles.setting_button,
            {backgroundColor: !isRunning ? '#FFC943':'#FFECBD'}]}/>
        </TouchableOpacity>
        <View style={{backgroundColor:'#FFC943', padding: 5, borderRadius:10}}>
            <Text style={{}}>
                Cycle restant : {remainingCycle}
            </Text>
        </View>

        {/* Modals (/pop-up) pour page si clique sur bouton paramétrage */}
        <Modal transparent visible={clickParam} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
            
            <View style={[stylesProfil.confContener, {height:'70%', backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                <Text style={[stylesProfil.confText, {paddingTop:10, paddingBottom:20, color: isDarkMode ? 'white' : 'black'}]}>
                    Réglez votre pomodoro </Text>

                <View style={{padding:10, gap:20}}>
                  <View style={[styles.paramContent, { flexDirection:'row'}]}>
                  <Text>Temps d'étude</Text>

                  <TouchableOpacity style={[styles.paramContent, styles.styleToSelectTime,
                      {marginLeft:85, flexDirection:'row' }]} onPress={()=>setClickSelectStudy(true)}>

                      <Text style={{color:'#757575', padding:0, margin:0, marginTop:-10}}>
                      <TextInput keyboardType="numeric" maxLength={4} style={{color:'grey', height:40, padding:0,}}
                                 value={`${defaultStudyTime}`} onChangeText={handleStudyText}/></Text>
                      <Text style={{padding:0, margin:0,}}> min</Text>
                  <IonIcons name='chevron-down' size={22} color="black"> </IonIcons>
                  </TouchableOpacity>
                  </View>

                    {/* -------------------- Ouvre modal pour sélectionner le temps d'étude -------------------- */}
                    <Modal transparent visible={clickSelectStudy} animationType='none' >
                  <Pressable style={[stylesProfil.confPage, {flex:1}]} onPress={() =>
                      setClickSelectStudy(false)} >

                  <Pressable onPress={() =>{}}>
                  <View style={[styles.styleSelectTime, stylesProfil.shadow, {}]}>
                    <TouchableOpacity onPress={() =>{clickStudyTime('10')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='10' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='10' ? 'white' : 'black'}}>10 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime('20')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='20' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='20' ? 'white' : 'black'}}>20 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime('30')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='30' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='30' ? 'white' : 'black'}}>30 min</Text>
                    </TouchableOpacity > 
                    <TouchableOpacity onPress={() =>{clickStudyTime('40')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='40' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='40' ? 'white' : 'black'}}>40 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime('50')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='50' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='50' ? 'white' : 'black'}}>50 min</Text>
                    </TouchableOpacity >  
                    <TouchableOpacity onPress={() =>{clickStudyTime('60')}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime=='60' ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime=='60' ? 'white' : 'black'}}>60 min</Text>
                    </TouchableOpacity >    
                  </View>
                  </Pressable>
                  </Pressable>

                  </Modal>

                  <View style={styles.paramContent}>
                  <Text>Temps de pause</Text>
                  <TouchableOpacity style={[styles.paramContent, styles.styleToSelectTime,
                      {marginLeft:72, flexDirection:'row' }]}
                  onPress={()=>setClickSelectBreak(true)}>
                      <Text style={{color:'#757575', padding:0, margin:0, marginTop:-10}}>
                          <TextInput keyboardType="numeric" maxLength={4} style={{color:'grey', height:40, padding:0,}}
                                     value={`${defaultBreakTime}`} onChangeText={handleBreakText}/></Text>
                      <Text style={{padding:0, margin:0,}}> min</Text>
                  <IonIcons name='chevron-down' size={22} color="black"> </IonIcons>
                  </TouchableOpacity>
                  </View>
                    {/* -------------------- Ouvre modal pour sélectionner le temps de pause -------------------- */}
                    <Modal transparent visible={clickSelectBreak} animationType='none' >
                        <Pressable style={[stylesProfil.confPage, {flex:1}]}
                                          onPress={() => setClickSelectBreak(false)}>
                            <Pressable onPress={() =>{}} style={{width: 0,}} >
                                <View style={[styles.styleSelectBreak, stylesProfil.shadow, {}]}>
                                    <TouchableOpacity onPress={() =>{clickBreakTime('5')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='5' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='5' ? 'white' : 'black'}}>5 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime('10')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='10' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='10' ? 'white' : 'black'}}>10 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime('15')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='15' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='15' ? 'white' : 'black'}}>15 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime('20')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='20' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='20' ? 'white' : 'black'}}>20 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime('25')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='25' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='25' ? 'white' : 'black'}}>25 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime('30')}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime=='30' ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime=='30' ? 'white' : 'black'}}>30 min</Text>
                                    </TouchableOpacity >
                                </View>
                            </Pressable>
                        </Pressable>

                    </Modal>



                    <View style={[styles.paramContent, {flexDirection:'column',height:170}]}>

                  {/* -------------------- Selection du nombre de répétitions -------------------- */}
                  <Text style={{}}>Répétitions</Text>                  
                  <View style={{alignItems:'center', gap:2}}>
                    <Pressable onPress={() =>{clickRepeat(1)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==1 ? 'grey' : '#D9D9D9'}] } >
                      <Text style={{color: defaultRepetition==1 ? 'white' : 'black'}}>1</Text>
                      </Pressable >

                    <Pressable onPress={() =>{clickRepeat(2)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==2 ? 'grey' : '#D9D9D9'}]} > 
                      <Text style={{color: defaultRepetition==2 ? 'white' : 'black'}}>2</Text>
                      </Pressable > 
                    
                    <Pressable onPress={() =>{clickRepeat(3)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==3 ? 'grey' : '#D9D9D9'}]}>
                      <Text style={{color: defaultRepetition==3 ? 'white' : 'black'}}>3</Text>
                      </Pressable >

                    <Pressable onPress={() =>{clickRepeat(4)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==4 ? 'grey' : '#D9D9D9'}]}>
                      <Text style={{color: defaultRepetition==4 ? 'white' : 'black'}}>4</Text>
                      </Pressable >
                                          
                      <Pressable onPress={() =>{clickRepeat(5)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==5 ? 'grey' : '#D9D9D9'}]}>
                      <Text style={{color: defaultRepetition==5 ? 'white' : 'black'}}>5</Text>
                      </Pressable >
                  </View>
                  </View>
                </View>
                

                <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "5%", marginTop:40 }}>
                    <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor:'#9CAFEF'}]}
                    onPress={()=> {setClickParam(!clickParam); setNumCycle(defaultRepetition);
                    setPomodoroDuration(defaultStudyTime); setBreakDuration(defaultBreakTime);
                    updateTime(Number(defaultStudyTime) ); }}>

                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> OK </Text>
                        </TouchableOpacity>

                    <TouchableOpacity style={[stylesProfil.clickButton,
                      {backgroundColor: isDarkMode ? '#565681' : 'white', borderColor:'black'}]} 
                      onPress={() => {setClickParam(!clickParam); setDefaultRepetition(numCycle);
                      setDefaultStudyTime(pomodoroDuration); setDefaultBreakTime(breakDuration)}}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> Annuler </Text>
                        </TouchableOpacity>
                </View>
            </View>

            </View>
        </Modal> 


        </View>

        <View style={styles.infoBloc}>
        <IonIcons name="time-outline" size={25} color={'black'} style={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5}}> {pomodoroDuration} min </Text>
        <IonIcons name="cafe-outline" size={25} color={'black'} style={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5}}> {breakDuration} min </Text>
        <IonIcons name="refresh-outline" size={25} color={'black'} style={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5, paddingRight:5}}> {numCycle} </Text>
        </View>
        
        {/* -------------------- Partie Boutons -------------------- */}
        <View style={{flexDirection:'row', alignContent:'center',gap : "20%", marginTop:40 }}>
        <TouchableOpacity style={[styles.actionButton, {backgroundColor: isRunning ? '#9CAFEF' : ((timeLeft ===0) ? 'grey' : '#9D75F2')}]}
                          onPress={isRunning ? pause_button : start_button} disabled={timeLeft ===0}>
        
        <Text style={{color: 'white', fontSize:18}}> {button_start_text} </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, {backgroundColor:"#F28C8C"}]} onPress={stop_button}>
        <Text style={{color: 'white', fontSize:18,}}> Stop </Text>
        </TouchableOpacity>
        </View>
        </View>
      {/* -------------------- Fin Section Minuteur pomodoro  -------------------- */}
      {/* -------------------- Section Historique pomodoro  -------------------- */}
      
      <View style={{marginTop:30, alignSelf: 'flex-start'}}>
          <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:20, fontWeight:'bold',
              marginBottom:10, marginTop:20}}>Historique</Text>
          <View style={[stylesProfil.drawHorLine, {width: width*0.6 , backgroundColor: isDarkMode ? 'white' : 'black'}]}></View>
      </View>
        {/* Modals (/pop up) pour page si pomodoro est fini */}
        <Modal transparent visible={isFinished} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
                <View style={[stylesProfil.confContener, {backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                    <Text style={[stylesProfil.confText, {marginTop:15, margin:5, color: isDarkMode ? 'white' : 'black'}]}>
                        Bravo pour avoir fini la session de pomodoro !</Text>
                    <IonIcons name="ribbon-outline" size={35} color={isDarkMode ? 'white': 'black'}
                              style={{ marginTop: 10, marginBottom:10,alignSelf:'center'}}/>

                        <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "15%", marginBottom:0 }}>
                        <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor:'#9CAFEF'}]} onPress={() =>
                            setIsFinished(false)} >
                            <Text style={[stylesProfil.confText, {  color: isDarkMode ? 'white' : 'black'}]}> OK </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </Modal>
        <ScrollView  horizontal={true} style={{marginLeft: -15, marginRight:-10}} showsHorizontalScrollIndicator={false} >
            <ScrollView horizontal={false}>
            {sessions.map((session) => (

                    <View key={session.id} style={{borderWidth:2, borderColor:isDarkMode ? 'white': 'black',
                    marginBottom:10, flexDirection:'row', padding:5, borderRadius:10, }}>

                    {session.isCompleted && <IonIcons name={'checkmark-outline'} size={35} color={isDarkMode ? 'black': 'white'}
                              style={{ marginTop: 10, marginBottom:10,alignSelf:'center',
                                  backgroundColor:'#4BAE4F', borderRadius:40, marginRight:15}}/>}
                    {(!session.isCompleted) && <IonIcons name={'close-outline'} size={35} color={isDarkMode ? 'black': 'white'}
                                                      style={{ marginTop: 10, marginBottom:10,alignSelf:'center',
                                                          backgroundColor:'#FF4141', borderRadius:40, marginRight:10}}/>}
                        <View >
                            <Text style={{fontWeight:'bold'}} > {days[new Date().getDay()]} {new Date().getDay()} {new Date().toLocaleString('fr-FR', { month: 'long' })} {new Date().getFullYear()}</Text>
                            <View style={{ flexDirection:'row', }}>
                                <Text style={{color:'grey'}}>Durée:{session.durationSession} min Pause:{session.breakSession} min Répétitions:{session.repeatSession}</Text>
                                <TouchableOpacity style={{alignSelf:'center', marginLeft:5, backgroundColor:isDarkMode ? '#4D4D71': '#D9D9D9',
                                    borderRadius:20, padding:4, marginTop:-2, }} onPress={() => handleDeleteSession(session.id)}>
                                    <IonIcons name={"trash-outline"} size={20} style={{color:isDarkMode ? 'white': 'black'}}></IonIcons>
                                </TouchableOpacity>

                            </View>

                        </View>

                </View>
            ))}
            <View>

            </View>
            </ScrollView>
        </ScrollView>
</View>

    </ScrollView>)}


{/* -------------------- Section Style -------------------- */}
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
