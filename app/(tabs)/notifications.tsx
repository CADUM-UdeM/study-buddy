import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from "react-native";


export default function HomeScreen() {
const router = useRouter();
const [toggle_one, set_toggle_one] = useState(false)
const [toggle_two, set_toggle_two] = useState(false)
const [toggle_three, set_toggle_three] = useState(false)
const [toggle_four, set_toggle_four] = useState(false)


const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';

return (
    <View style ={styles.buttonStyle}> 
    <TouchableOpacity style={styles.go_back_button} onPress={() => router.push("/profil")}>
                    <IonIcons name="return-down-back-outline" size={40} color={'black'}/>
                </TouchableOpacity>

    <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyTracker </Text>
            <Text></Text>
            <Text style={{color: isDarkMode ? 'white' : 'black', fontSize: 20, fontWeight:'bold'}}> Notification </Text>
            <Text></Text>

        <View style={styles.button_notif}>
        <View style={[styles.button_notif_background, {backgroundColor: isDarkMode ? 'black' : 'white',  borderColor:isDarkMode ? 'white' : 'black'}]}>
        <Text style={{color: isDarkMode ? 'white' : 'black', flex:1}}>Annonce nouvelle mise à jour</Text>
        <Switch thumbColor={toggle_one ? '#44964F' : 'grey'}  trackColor={{ false: '#D9D9D9', true: '#61C36E' }} value={toggle_one} onChange={()=>set_toggle_one(!toggle_one)}
        />
        </View>
        </View>

        <View style={styles.button_notif}>
        <View style={{gap:'10', width: '160%', backgroundColor: isDarkMode ? 'black' : 'white',  borderColor:isDarkMode ? 'white' : 'black', borderWidth:3}}>
        <Text style={{color: isDarkMode ? 'white' : 'black', textDecorationLine: 'underline' }}>Alerte pendant la session pomodoro</Text>
        
        <View style={{flexDirection:'row',}}>
        <Text style={{color: isDarkMode ? 'white' : 'black', flex:1}}>10 minutes avant chaque pause</Text>
        <Switch thumbColor={toggle_two ? '#44964F' : 'grey'} trackColor={{ false: '#D9D9D9', true: '#61C36E' }} value={toggle_two} onChange={()=>set_toggle_two(!toggle_two)}/>
        </View>

        <View style={{flexDirection:'row',}}>
        <Text style={{color: isDarkMode ? 'white' : 'black', flex:1}}>5 minutes avant chaque pause</Text>
        <Switch thumbColor={toggle_three ? '#44964F' : 'grey'}  trackColor={{ false: '#D9D9D9', true: '#61C36E' }} value={toggle_three} onChange={()=>set_toggle_three(!toggle_three)}/>
        </View>
        </View>
        </View>

        <View style={styles.button_notif}>
        <View style={[styles.button_notif_background, {backgroundColor: isDarkMode ? 'black' : 'white',  borderColor:isDarkMode ? 'white' : 'black'}]}>
        <Text style={{color: isDarkMode ? 'white' : 'dark', flex:1}}>Nouveau icon débloqué</Text>
        <Switch thumbColor={toggle_four ? '#44964F' : 'grey'} trackColor={{ false: '#D9D9D9', true: '#61C36E' }} value={toggle_four} onChange={()=>set_toggle_four(!toggle_four)}/>
        </View>
        </View>
</View>
)
}

const styles = StyleSheet.create({
    buttonStyle:{
    padding:60,

    alignItems: "center",

    },
    go_back_button: {
        backgroundColor: '#C2E5FF',
        width: '25%',
        padding: 10,
        position: 'absolute',
        top: 60,
        right: '110%',
        borderRadius: 20,

    },
    button_notif:{
        flexDirection:'row',
        gap:'10', paddingHorizontal:50,
        padding:20
    },
    button_notif_background:{
        flexDirection:'row',
        gap:'10',
        width: '160%',
        borderWidth: 3,
       
    }
});
