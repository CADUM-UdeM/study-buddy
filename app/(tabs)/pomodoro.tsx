import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { stylesProfil } from "./profil";


export default function Pomodoro() {
const router = useRouter();
const [isRunning, setIsRunning] = useState(false)
const [isLocked, setIsLocked] = useState(false)
const  button_start_text   = isRunning ? 'Pause' : 'Débuter'
const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';

{/* Fonction pour formattage du chrono */}
const addZero = (num : number): string => { 
  if (num < 10) {
    return `0${num}`
  } 
  else {
      return `${num}` 
    }};

const hours = addZero(0)
const initMin = 25
const [min, setMin] = useState(addZero(initMin))
const [clickParam, setClickParam] = useState(false)

const sec = addZero(0)
const numCycle = 3
const breakDuration = 10
const pomodoroDuration = 60

const start_button = () => {
      setIsRunning(true);
}
const pause_button = () => {
      setIsRunning(false);
}

const stop_button = () => {
      setIsRunning(false);
      setMin(addZero(initMin))
}

const add_button = () => {
    if (Number(min) < 55){
    setMin(addZero(Number(min) + 5))}
}

const min_button = () => {
    if (Number(min) > 0){
      setMin(addZero(Number(min) - 5))}
}

{/* Pour tourner le chrono */}
useEffect(() => {
  
});


return (
  
        <View style ={styles.bodyStyle}> 
        <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyBudy </Text>
            <Text></Text>
        
        {/* -------------------- Section Chrono pomodoro  -------------------- */}
        <View style={[styles.timerSection, {borderColor: isDarkMode ? '#4D4D71' : '#B3B3B3'}]}>

        <Text style={{color: isDarkMode ? 'white' : 'black', fontSize:20, fontWeight:'bold', textAlign:'center', marginBottom:40, marginTop:20}}> Focus mode </Text>
        
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

        {/* Modals (/pop up) pour page si clique sur bouton déconnexion */}
        <Modal transparent visible={clickParam} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
            
            <View style={[stylesProfil.confContener, {height:'70%', backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                <Text style={[stylesProfil.confText, {paddingTop:10, paddingBottom:20, color: isDarkMode ? 'white' : 'black'}]}>
                    Réglez votre pomodoro </Text>

                <View style={{padding:10, gap:20}}>
                  <TouchableOpacity >
                  <View style={styles.paramContent}>
                  <Text>Temps d'étude</Text>
                  <Text style={{paddingLeft:85, color:'#757575'}}> {pomodoroDuration} min</Text>
                  </View>
                  </TouchableOpacity>

                  <TouchableOpacity >
                  <View style={styles.paramContent}>
                  <Text>Temps de pause</Text>
                  <Text style={{paddingLeft:75, color:'#757575'}}> {breakDuration} min</Text>
                  </View>
                  </TouchableOpacity>

                  <View style={[styles.paramContent, {flexDirection:'column',height:170}]}>
                  <Text style={{}}>Répétitions</Text>                  
                  <View style={{alignItems:'center', gap:2}}>
                    <TouchableOpacity> 
                      <Text>1</Text>
                      </TouchableOpacity >

                    <TouchableOpacity> 
                      <Text>2</Text>
                      </TouchableOpacity > 
                    
                      <TouchableOpacity> 
                      <Text>3</Text>
                      </TouchableOpacity >

                      <TouchableOpacity> 
                      <Text>4</Text>
                      </TouchableOpacity >
                                          
                      <TouchableOpacity> 
                      <Text>5</Text>
                      </TouchableOpacity >
                  </View>
                  </View>
                </View>
                

                <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "5%", marginTop:40 }}>
                    <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor:'#9CAFEF'}]} onPress={()=> setClickParam(!clickParam)}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> OK </Text>
                        </TouchableOpacity>

                    <TouchableOpacity style={[stylesProfil.clickButton, {backgroundColor: isDarkMode ? '#565681' : 'white', borderColor:'black'}]} onPress={() => setClickParam(!clickParam)}>
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
    }
});
