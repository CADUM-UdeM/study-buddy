import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    Dimensions,
    useWindowDimensions
} from "react-native";


export default function Profil() {

const colorScheme = useColorScheme();
const isDarkMode = colorScheme == 'dark';
const router = useRouter();
const [clickLogOut, setClickLogOut] = useState(false);
const [clickDelete, setDelete] = useState(false);
const {width, height} = useWindowDimensions()
const pageLogOut = ( )=> {
    setClickLogOut(!clickLogOut)
}

const pageDeleteAccount = ( )=> {
    setDelete(!clickDelete)
}

return (

    <View style ={stylesProfil.bodyStyle}>
        

    <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyBudy </Text>
            <Text></Text>
            <Text style={{color: isDarkMode ? 'white' : 'black', fontSize: 20, fontWeight:'bold'}}> Profil </Text>
            <Text></Text>
            <View style={stylesProfil.ImageProfile}>
                <Image source={require("../../assets/images/image-profile.png")} style={stylesProfil.image}></Image>
            </View>
        <Text></Text>

        {/* -------------------- Section body de la page profil -------------------- */}
        <View style={[stylesProfil.drawHorLine, { width:width*0.62, backgroundColor: isDarkMode ? 'white' : 'black'}]}></View>
        <View style={stylesProfil.alignIcon}>
        <View style={[stylesProfil.infoIcon, stylesProfil.shadow, {backgroundColor:isDarkMode ? '#565681' : '#F4F4F4'}]}>
        <View style={[]}>
        <IonIcons name="trophy-outline" size={23} color= {isDarkMode ? 'white' : 'black'}/>
        </View>
        <Text style={[stylesProfil.textButton, {fontSize: 15, marginLeft:3,
            color: isDarkMode ? 'white' : 'black'}]}>10 Badges</Text>
        </View> 
        
        <View style={[stylesProfil.infoIcon, stylesProfil.shadow, {backgroundColor:isDarkMode ? '#565681' : '#F4F4F4'}]}>
        <View style={[]}>
        <IonIcons name="alarm-outline" size={23} color= {isDarkMode ? 'white' : 'black'}/>
        </View>
        <Text style={[stylesProfil.textButton, {fontSize: 15, marginLeft:0, marginRight:"15%",
            color: isDarkMode ? 'white' : 'black'}]}>10 sessions complétés</Text>
        </View>
        </View>

        <View style={[stylesProfil.drawHorLine, {width:width*0.62, backgroundColor: isDarkMode ? 'white' : 'black'}]}></View>
        
        {/* -------------------- Section boutons clicables -------------------- */}
        <View style={stylesProfil.alignButton}>

        {/* -------------------- 1er bouton page informations du profil -------------------- */}
        <TouchableOpacity style={stylesProfil.infoButton}  onPress={() => router.push("/profil_info")}>
        <View style={[stylesProfil.shadow, {backgroundColor:'#FFC943'}]}>
        <IonIcons name="mail-outline" size={28} color={'black'}/>
        </View>
        <Text style={[stylesProfil.textButton, {color: isDarkMode ? 'white' : 'black'}]}>Mes informations</Text>
        </TouchableOpacity>

        {/* -------------------- 2eme bouton page gestion notifications -------------------- */}
        <TouchableOpacity style={stylesProfil.infoButton } onPress={() => router.push("/notifications")}>
        <View style={[stylesProfil.shadow, {backgroundColor:'#C2E5FF'}]}>
        <IonIcons name="notifications-outline" size={28} color={'black'}/>
        </View>
        <Text style={[stylesProfil.textButton, {color: isDarkMode ? 'white' : 'black'}]}>Notifications</Text>
        </TouchableOpacity>

        {/* -------------------- 3eme bouton page pour se deconnecter -------------------- */}
        <TouchableOpacity style={stylesProfil.infoButton} onPress={pageLogOut}>
        <View style={[stylesProfil.shadow, {backgroundColor:'#9CAFEF'}]}>
        <IonIcons name="log-out-outline" size={28} color={'black'} />
        </View>
        <Text style={[stylesProfil.textButton, {color: isDarkMode ? 'white' : 'black'}]}>Deconnexion</Text>
        </TouchableOpacity> 

        {/* Modals (/pop up) pour page si clique sur bouton déconnexion */}
        <Modal transparent visible={clickLogOut} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
            
            <View style={[stylesProfil.confContener, {backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}>
                    Êtes-vous sûr(e) de vouloir vous <Text style={{color:'#9CAFEF'}}>deconnecter</Text> ?
                </Text>

                <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "15%", marginTop:40 }}>
                    <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor:'#9CAFEF'}]} onPress={pageLogOut}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> Oui </Text>
                        </TouchableOpacity>

                    <TouchableOpacity style={[stylesProfil.clickButton, {backgroundColor: isDarkMode ? '#565681' : 'white', borderColor:'black'}]} onPress={pageLogOut}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> Non </Text>
                        </TouchableOpacity>
                </View>
            </View>

            </View>
        </Modal>       

        {/* -------------------- 4eme bouton page pour fermer le compte -------------------- */}
        <TouchableOpacity style={stylesProfil.infoButton} onPress={pageDeleteAccount}>
        <View style={[stylesProfil.shadow, {backgroundColor:'#F3AACE'}]}>
        <IonIcons name="trash-outline" size={28} color={'black'} />
        </View>
        <Text style={[stylesProfil.textButton, {color: isDarkMode ? 'white' : 'black'}]}>Supprimer le compte</Text>
        </TouchableOpacity>
        </View>
        <View style={[stylesProfil.drawHorLine, {backgroundColor: isDarkMode ? 'white' : 'black'}]}></View>
        
        {/* Modals (/pop up) pour page si clique sur bouton supprimer le compte */}
        <Modal transparent visible={clickDelete} animationType='none' >
            <View style={[stylesProfil.confPage, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(1,1,1,0.6)'}]}>
            
            <View style={[stylesProfil.confContener, {backgroundColor: isDarkMode ? '#565681' : 'white'}]}>
                <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}>
                    Êtes-vous sûr(e) de vouloir <Text style={{color:'#F3AACE'}}>supprimer</Text> votre compte ?
                </Text>

                <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "15%", marginTop:40 }}>
                    <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor:'#F3AACE'}]} onPress={pageDeleteAccount}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> Oui </Text>
                        </TouchableOpacity>

                    <TouchableOpacity style={[stylesProfil.clickButton, {backgroundColor: isDarkMode ? '#565681' : 'white', borderColor:'black'}]} onPress={pageDeleteAccount}>
                        <Text style={[stylesProfil.confText, {color: isDarkMode ? 'white' : 'black'}]}> Non </Text>
                        </TouchableOpacity>
                </View>
            </View>

            </View>
        </Modal>

        {/* -------------------- Fin Section body de la page profil -------------------- */}

    </View>
)
}


{/* -------------------- Section Style -------------------- */}
export const stylesProfil = StyleSheet.create({
    textButton:{
        color:'black', fontSize:20, textAlign:'center', marginLeft:10
    },
    infoIcon:{
        flexDirection:'row',
        marginLeft: 10
    },
    actionButton:{
        padding: 10,
        alignItems:'stretch',
        marginBottom:20,
        borderRadius:20,
        minWidth:250,
        alignContent:'center',
        flexDirection:'row'
    },

    drawHorLine:{
        backgroundColor:'black',
        height:1,
        marginVertical: 9,
        width: '120%'
    },
    alignIcon:{
        maxWidth: '60%',
        justifyContent:'center',
        flexDirection:'row',
        display:'flex',
        padding : 0,
        margin: 0,
        paddingHorizontal:0
    },
    alignButton:{
        flexDirection:'column'
    },

    infoButton:{
        padding: 10,
        alignItems:'center',
        marginBottom:10,
        borderRadius:20,
        minWidth:250,
        alignContent:'center',
        flexDirection:'row',
    },

    ImageProfile:{
    },
    image:{
        width:120,
        height:120

    },
    bodyStyle:{
        paddingTop: 100,
        padding:100,
        alignItems: "center",
    },
    shadow:{
        borderRadius:5,
        padding:4,
        shadowColor: 'black',
        shadowOpacity:0.1,
        shadowOffset: {
                width: 0,
                height:3,
        },
        elevation: 3
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
    confPage:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    confContener:{
        height:'28%',
        width:'80%',
        padding:10,
        borderRadius:20
    },
    confText:{
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center'
    },
    clickButton: {
        alignItems: "center",
        padding: 10,
        margin:10,
        minWidth: 110,
        borderRadius:15,
        borderWidth:1,
        borderColor:'transparent'
    },
});
