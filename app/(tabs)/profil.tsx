import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";


export default function HomeScreen() {

const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';
const router = useRouter();

const log_out = ( )=> {
    Alert.alert(
        'Êtes-vous sûr(e) de vouloir vous deconnecter ?',
        undefined, 
        [
        {
            text:'Oui',
            style:'cancel',
        },
        {
            text:'Non'
        },    
    ])
}

const delete_account = ( )=> {
    Alert.alert(
        'Êtes-vous sûr(e) de vouloir supprimer votre compte ?',
        undefined, 
        [
        {
            text:'Oui',
            style:'cancel', 
        },
        {
            text:'Non'
        },    
    ])
}
return (
    <View style ={styles.buttonStyle}>
        

    <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyTracker </Text>
            <Text></Text>
            <Text style={{color: isDarkMode ? 'white' : 'black', fontSize: 20, fontWeight:'bold'}}> Profil </Text>
            <Text></Text>
            <View style={styles.ImageProfile}>
                <Image source={require("../../assets/images/image-profile.png")} style={styles.image}></Image>
            </View>
        <Text></Text>


        <TouchableOpacity style={styles.infoButton}  onPress={() => router.push("/profil_info")}>
        <IonIcons name="menu" size={28} color={'black'} />
        <Text style={styles.textButton}>Mes informations</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.infoButton} onPress={() => router.push("/notifications")}>
        <IonIcons name="notifications-outline" size={28} color={'black'} />
        <Text style={styles.textButton}>Notifications</Text>
        </TouchableOpacity>
        <Text></Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={log_out}>
        <IonIcons name="log-out-outline" size={28} color={'black'} />
        <Text style={styles.textButton}>Deconnection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={delete_account}>
        <IonIcons name="trash-outline" size={28} color={'black'} />
        <Text style={styles.textButton}>Supprimer le compte</Text>
        </TouchableOpacity>
    </View>
)
}



const styles = StyleSheet.create({
    textButton:{
        color:'white', fontSize:20, textAlign:'center', marginLeft:10 },

    actionButton:{
        backgroundColor:'#C2E5FF',
        padding: 10,
        alignItems:'stretch',
        marginBottom:20,
        borderRadius:20,
        minWidth:250,
        alignContent:'center',
        flexDirection:'row'

    },
    infoButton:{
        backgroundColor:'#DCCCFF',
        padding: 10,
        alignItems:'stretch',
        marginBottom:20,
        borderRadius:20,
        minWidth:250,
        alignContent:'center',
        flexDirection:'row'

    },

    ImageProfile:{
    },
    image:{
        width:120,
        height:120
        
    },
    buttonStyle:{
    padding:100,
    alignItems: "center",

    },
    titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    },
    stepContainer: {
    gap: 8,
    marginBottom: 8,
    },
    reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
    },
});
