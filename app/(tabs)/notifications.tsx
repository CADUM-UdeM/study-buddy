import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from "react-native";


export default function Notifications() {
const router = useRouter();
const [toggle_one, set_toggle_one] = useState(false)
const [toggle_two, set_toggle_two] = useState(false)
const [toggle_three, set_toggle_three] = useState(false)
const [toggle_four, set_toggle_four] = useState(false)


const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';

return (
        <View style ={styles.bodyStyle}> 
        <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyBudy </Text>
            <Text></Text>

        <View style={{flexDirection:'row', padding: 10, marginRight:0, gap: 90}}>
        <TouchableOpacity style={[]} onPress={() => router.push("/profil")}>
                    <IonIcons name="arrow-back-sharp" size={30} color={isDarkMode ? 'white' : 'black'}/>
                </TouchableOpacity>
            <Text style={{color: isDarkMode ? 'white' : 'black', fontSize: 20, fontWeight:'bold'}}> Notification </Text>
            <Text></Text>
        </View>

        {/* -------------------- Partie Boutons -------------------- */}

        {/* 1ere section pour mise a jour*/}
        <View style={[styles.buttonNotif]}>
        <View style={[styles.buttonNotifBackground, styles.shadow, {backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
        <Text style={[styles.textNotif, {color: isDarkMode ? 'white' : 'dark'}]}>Annonce nouvelle mise à jour</Text>
        <Switch thumbColor={toggle_one ? '#006CFA' : 'grey'}  trackColor={{ false: '#D9D9D9', true: '#4294FF' }} value={toggle_one} onChange={()=>set_toggle_one(!toggle_one)}
        />
        </View>
        </View>

        {/* 2eme section pour alerte durant session pomodoro*/}
        <View style={styles.buttonNotif}>
        <View style={[styles.shadow, {gap:'10', width: '160%', backgroundColor: isDarkMode ? '#565681' : 'white', borderRadius:10 }]}>
        <Text style={{marginLeft:10, color: isDarkMode ? 'white' : 'black', textDecorationLine: 'underline' }}>Alerte pendant la session pomodoro</Text>
        
        <View style={{flexDirection:'row', alignItems:'center',}}>
        <Text style={[styles.textNotif, {color: isDarkMode ? 'white' : 'dark'}]}>10 minutes avant chaque pause</Text>
        <Switch thumbColor={toggle_two ? '#006CFA' : 'grey'} trackColor={{ false: '#D9D9D9', true: '#4294FF' }} value={toggle_two} onChange={()=>set_toggle_two(!toggle_two)}/>
        </View>
        <View style={{flexDirection:'row', alignItems:'center',}}>
        <Text style={[styles.textNotif, {color: isDarkMode ? 'white' : 'dark'}]}>5 minutes avant chaque pause</Text>
        <Switch thumbColor={toggle_three ? '#006CFA' : 'grey'}  trackColor={{ false: '#D9D9D9', true: '#4294FF' }} value={toggle_three} onChange={()=>set_toggle_three(!toggle_three)}/>
        </View>
        </View>
        </View>

        {/* 3eme section pour annonce quand nouveau badge debloque */}
        <View style={styles.buttonNotif}>
        <View style={[styles.buttonNotifBackground, styles.shadow, {backgroundColor: isDarkMode ? '#565681' : 'white',}]}>
        <Text style={[styles.textNotif, {color: isDarkMode ? 'white' : 'dark'}]}>Nouveau icon débloqué</Text>
        <Switch thumbColor={toggle_four ? '#006CFA' : 'grey'} trackColor={{ false: '#D9D9D9', true: '#4294FF' }} value={toggle_four} onChange={()=>set_toggle_four(!toggle_four)}/>
        </View>
        </View>
</View>
)
}


{/* -------------------- Section Style -------------------- */}
const styles = StyleSheet.create({
    bodyStyle:{
    paddingTop: 100,
    padding:60,
    alignItems: "center",
    },

    buttonNotif:{
        flexDirection:'row',
        gap:'10',
        paddingHorizontal:50,
        padding:20,
        },

    buttonNotifBackground:{
        alignItems:'center',
        flexDirection:'row',
        gap:'10',
        width: '160%',
        height:'90%',
        borderWidth: 0,
        borderRadius:10,
        padding:4,
    
    },
    shadow :{
        shadowColor: 'black',
        shadowOpacity:0.1,
        shadowOffset: {
                width: 0,
                height:3,
        },
        elevation: 3   
    },
    textNotif:{
        flex:1,
        marginLeft:8,
        fontSize:15
    }
});
