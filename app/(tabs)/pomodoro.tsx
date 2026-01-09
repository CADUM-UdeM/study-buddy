import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { stylesProfil } from "./profil";


export default function Pomodoro() {
const router = useRouter();
const [isRunning, setIsRunning] = useState(false)
const [isLocked, setIsLocked] = useState(false)
const  button_start_text   = isRunning ? 'Pause' : 'Débuter'
const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';

const [defaultRepetition, setDefaultRepetition] = useState(3)
const [defaultStudyTime, setDefaultStudyTime] = useState(60)
const [defaultBreakTime, setDefaultBreakTime] = useState(10)


{/* Fonction pour formatage du chronomètre */}
const addZero = (num : number): string => { 
  if (num < 10) {
    return `0${num}`
  } 
  else {
      return `${num}` 
    }};


const [initHours, setInitHours] = useState(0)
const [hours, setHours] = useState(addZero(initHours))
const [initMin, setInitMin] = useState(25)
const [min, setMin] = useState(addZero(initMin))
const sec = addZero(0)

const [clickParam, setClickParam] = useState(false)
const [clickSelectStudy, setClickSelectStudy] = useState(false)
const [clickSelectBreak, setClickSelectBreak] = useState(false)



const [numCycle, setNumCycle] = useState(defaultRepetition)
const [breakDuration, setBreakDuration] = useState(10)
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
    if (Number(min) > 0){
        setMin(addZero(Number(min) - 5))}
    else if(Number(hours)> 0){
        setMin(addZero(Number(55)))
        setHours(addZero(Number(hours) -1))}
}

{/* Pour tourner le chrono */}
useEffect(() => {
  
});



{/* -------------------- Pour changer les paramètres du pomodoro  -------------------- */}

const clickRepeat = (index : number) => {
    setDefaultRepetition(index)
}
const clickStudyTime = (index : number) => {
        setDefaultStudyTime(index)
}
const clickBreakTime = (index : number) => {
        setDefaultBreakTime(index)
}
const updateTime = (hours:number, minutes : number) => {
        const newMin = addZero(Number((minutes% 60)))
        setMin(newMin)
        setInitMin(Number(newMin))
        const newHours = addZero(Number(hours + Math.floor(minutes/ 60)))
        setHours(newHours)
        setInitHours(Number(newHours))
}

return (
  
        <View style ={styles.bodyStyle}> 
        <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyBudy </Text>
            <Text></Text>
        
        {/* -------------------- Section Chrono pomodoro  -------------------- */}
        <View style={[styles.timerSection, {borderColor: isDarkMode ? '#4D4D71' : '#B3B3B3'}]}>

        <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:20, fontWeight:'bold', 
          textAlign:'center', marginBottom:40, marginTop:20}}> Focus mode </Text>
        
        {/* -------------------- Partie Chrono -------------------- */}
        <View style={{flexDirection:'row', alignItems:'center',  justifyContent:'center', gap : "4%", }}>
        
        {/*  Diminue le temps */}
        <TouchableOpacity style={[styles.time_button]} onPress={min_button}>
        <IonIcons name="remove-outline" size={35} color={isDarkMode ? '#B3B3B3' : '#757575'} style={styles.time_button}/>
        </TouchableOpacity>

        {/*  Minuteur */}
        <View style={[styles.chrono, {borderColor:"#FFC943"}]}>
        <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:30, alignSelf:'center', fontWeight:'bold'}}> {hours}:{min}:{sec} </Text>
        </View>
        
        {/*  Ajoute du temps */}
        <TouchableOpacity style={[styles.time_button]} onPress={add_button}>
        <IonIcons name="add-outline" size={35} color={isDarkMode ? '#B3B3B3' : '#757575'} style={styles.time_button}/>
        </TouchableOpacity>
        </View>

        {/*  Option Chrono */}
        <View style={{flexDirection:'row', justifyContent:'center',gap : "30%", marginTop:0 }}>
        <TouchableOpacity onPress={()=> setClickParam(!clickParam)}>
        <IonIcons name="options-outline" size={18} color={'black'} style={styles.setting_button}/>
        </TouchableOpacity>

        {/* Modals (/pop-up) pour page si clique sur bouton déconnexion */}
        <Modal transparent visible={clickParam} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
            
            <View style={[stylesProfil.confContener, {height:'70%', backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                <Text style={[stylesProfil.confText, {paddingTop:10, paddingBottom:20, color: isDarkMode ? 'white' : 'black'}]}>
                    Réglez votre pomodoro </Text>

                <View style={{padding:10, gap:20}}>
                  <View style={styles.paramContent}>
                  <Text>Temps d'étude</Text>

                  {/* -------------------- Ouvre modal pour sélectionner le temps d'étude -------------------- */}
                  <TouchableOpacity style={[styles.paramContent, styles.styleToSelectTime, {marginLeft:85,}]} onPress={()=>setClickSelectStudy(true)}>
                  <Text style={{ color:'#757575'}}> {defaultStudyTime} min</Text>
                  <IonIcons name='chevron-down' size={22} color="black"> </IonIcons>
                  </TouchableOpacity>
                  </View>
                  <Modal transparent visible={clickSelectStudy} animationType='none' >
                  <TouchableOpacity style={[stylesProfil.confPage, {flex:1}]} onPress={() => setClickSelectStudy(false)}>
                  <Pressable onPress={() =>{}}>
                  <View style={[styles.styleSelectTime, stylesProfil.shadow, {}]}>
                    <TouchableOpacity onPress={() =>{clickStudyTime(10)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==10 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==10 ? 'white' : 'black'}}>10 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime(20)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==20 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==20 ? 'white' : 'black'}}>20 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime(30)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==30 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==30 ? 'white' : 'black'}}>30 min</Text>
                    </TouchableOpacity > 
                    <TouchableOpacity onPress={() =>{clickStudyTime(40)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==40 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==40 ? 'white' : 'black'}}>40 min</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() =>{clickStudyTime(50)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==50 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==50 ? 'white' : 'black'}}>50 min</Text>
                    </TouchableOpacity >  
                    <TouchableOpacity onPress={() =>{clickStudyTime(60)}} style={[styles.styleText,
                        {backgroundColor: defaultStudyTime==60 ? 'grey' : '#D9D9D9'}]} >
                        <Text style={{color: defaultStudyTime==60 ? 'white' : 'black'}}>60 min</Text>
                    </TouchableOpacity >    
                  </View>
                  </Pressable>
                  </TouchableOpacity>

                  </Modal>

                  <View style={styles.paramContent}>
                  <Text>Temps de pause</Text>
                  <TouchableOpacity style={[styles.paramContent, styles.styleToSelectTime, {marginLeft:72}]}
                  onPress={()=>setClickSelectBreak(true)}>
                  <Text style={{color:'#757575'}}> {defaultBreakTime} min</Text>
                  <IonIcons name='chevron-down' size={22} color="black"> </IonIcons>
                  </TouchableOpacity>
                  </View>
                    {/* -------------------- Ouvre modal pour sélectionner le temps de pause -------------------- */}
                    <Modal transparent visible={clickSelectBreak} animationType='none' >
                        <TouchableOpacity style={[stylesProfil.confPage, {flex:1}]} onPress={() => setClickSelectBreak(false)}>
                            <Pressable onPress={() =>{}}>
                                <View style={[styles.styleSelectBreak, stylesProfil.shadow, {}]}>
                                    <TouchableOpacity onPress={() =>{clickBreakTime(5)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==5 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==5 ? 'white' : 'black'}}>5 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime(10)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==10 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==10 ? 'white' : 'black'}}>10 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime(15)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==15 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==15 ? 'white' : 'black'}}>15 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime(20)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==20 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==20 ? 'white' : 'black'}}>20 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime(25)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==25 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==25 ? 'white' : 'black'}}>25 min</Text>
                                    </TouchableOpacity >
                                    <TouchableOpacity onPress={() =>{clickBreakTime(30)}} style={[styles.styleText,
                                        {backgroundColor: defaultBreakTime==30 ? 'grey' : '#D9D9D9'}]} >
                                        <Text style={{color: defaultBreakTime==30 ? 'white' : 'black'}}>30 min</Text>
                                    </TouchableOpacity >
                                </View>
                            </Pressable>
                        </TouchableOpacity>

                    </Modal>



                    <View style={[styles.paramContent, {flexDirection:'column',height:170}]}>

                  {/* -------------------- Selection du nombre de répétitions -------------------- */}
                  <Text style={{}}>Répétitions</Text>                  
                  <View style={{alignItems:'center', gap:2}}>
                    <Pressable onPress={() =>{clickRepeat(1)}} style={[styles.selectRepetition, 
                      {backgroundColor: defaultRepetition==1 ? 'grey' : '#D9D9D9'}]} > 
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
                    updateTime(0, defaultStudyTime )}}>

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

        <TouchableOpacity>
        <IonIcons name={isLocked ? "lock-closed-outline": "lock-open-outline"} size={18} color={'black'} 
        style={[styles.setting_button, {backgroundColor: isLocked ? '#FFC943':'#FFECBD'}]} onPress={() => setIsLocked(!isLocked)}/>
        </TouchableOpacity>
        </View>

        <View style={styles.infoBloc}>
        <IonIcons name="time-outline" size={25} color={'black'} style={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5}}> {pomodoroDuration} min </Text>
        <IonIcons name="cafe-outline" size={25} color={'black'} sstyle={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5}}> {breakDuration} min </Text>
        <IonIcons name="refresh-outline" size={25} color={'black'} style={styles.infoButton}/>
        <Text style={{fontWeight:'bold', fontSize:18, color:'white', marginLeft:-5, paddingRight:5}}> {numCycle} </Text>
        </View>
        
        {/* -------------------- Partie Boutons -------------------- */}
        <View style={{flexDirection:'row', alignContent:'center',gap : "20%", marginTop:40 }}>
        <TouchableOpacity style={[styles.actionButton, {backgroundColor: isRunning ? '#9CAFEF' : '#9D75F2'}]} onPress={isRunning ? pause_button : start_button}>
        
        <Text style={{color: 'white', fontSize:18}}> {button_start_text} </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, {backgroundColor:"#F28C8C"}]} onPress={stop_button}>
        <Text style={{color: 'white', fontSize:18,}}> Stop </Text>
        </TouchableOpacity>
        </View>
        </View>
      {/* -------------------- Fin Section Chrono pomodoro  -------------------- */}
      {/* -------------------- Section Historique pomodoro  -------------------- */}
      
      <View>

      </View>

</View>)}


{/* -------------------- Section Style -------------------- */}
const styles = StyleSheet.create({
    styleText:{
      alignItems:'center',
      marginBottom: 10,
      borderRadius:20,
    },
    bodyStyle:{
      paddingTop: 100,
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
    chrono:{
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
        marginLeft:200,
        padding:10,
        marginTop:40,
        backgroundColor:'#D9D9D9',
    }
});
