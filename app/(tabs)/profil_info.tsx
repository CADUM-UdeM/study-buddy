import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme,
    useWindowDimensions
} from "react-native";
import { colors } from "../theme/colors";
import { stylesProfil } from './profil';

export default function Profil_info() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme == 'dark';
    const {width, height} = useWindowDimensions()

    const [notModified, isNotModified] = useState(true);
    
    const [pseudo, setPseudo] = useState('Blabla');
    const [pseudo_text, pseudo_text_change] = useState(pseudo);

    const [email, setEmail] = useState('example@gmail.com');
    const [email_text, set_email_text] = useState(email);

    const [password, setPassword] = useState('MDP123test');
    const [password_text, set_password_text] = useState('MDP123test');

    const [show_password, set_show_password] = useState(true);
    const router = useRouter();
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);

    const [isDefaultImage, setIsDefaultImage] = useState(true);
    const [clickGiveUp, setClickGiveUp] = useState(false);
    const [textClick, setTextClick] = useState("Voulez-vous abandonner les modifications ?")
    
    const pageCancel = () => {
        setClickGiveUp(!clickGiveUp)
        setTextClick("Voulez-vous abandonner les modifications ?")
        pseudo_text_change(pseudo)
        set_password_text(password)
        set_email_text(email)
    }

    const pageSave = () => {
        setClickGiveUp(!clickGiveUp)
        setTextClick("Voulez-vous sauvegarder les modifications ?")
    }

    const add_button = () => {
        Alert.alert(
            'Êtes-vous sûr(e) de vouloir ajouter une image ?',
            undefined,
            [{
                text: 'Oui',
                style: 'cancel',
            }, {
                text: 'Non'
            },
            ])
    }

    useEffect(() => {
        if(password_text.length < 8
            || !/[a-z]/.test(password_text)
            || !/[A-Z]/.test(password_text)
            || !/[0-9]/.test(password_text)) {
            setIsPasswordCorrect(false)
        }
        else {
            setIsPasswordCorrect(true)
        }
    }, [password_text]);
    return (

          <ScrollView contentContainerStyle={[styles.bodyStyle, ]} >
            <Text style={{color: isDarkMode ? colors.white : colors.black}}> StudyBudy </Text>
            <Text></Text>


            {/* -------------------- Affichage du nom de la page -------------------- */}
            {!notModified && (
            <View style={{flexDirection:'row', padding: 10}}>
            <Text style={{color: isDarkMode ? colors.white : colors.black, fontSize: 20, fontWeight:'bold'}}> Mes informations </Text>
            <Text></Text>
            </View> )}

            {notModified && (
            <View style={{flexDirection:'row', padding: 10, gap: 80}}>
            <TouchableOpacity style={[]} onPress={() => router.push("/profil")}>
                    <IonIcons name="arrow-back-sharp" size={30} color={isDarkMode ? colors.white : colors.black}/>
                </TouchableOpacity>
            <Text style={{color: isDarkMode ? colors.white : colors.black, fontSize: 20, fontWeight:'bold', marginLeft:-30}}> Mes informations </Text>
            <Text></Text>
            </View> )}

            {/* -------------------- Affichage image du profile -------------------- */}
            <View style={styles.ImageProfile}>
                
            {isDefaultImage && <Image source={require("../../assets/images/image-profile.png")} style={styles.image}></Image>}
            
            </View>
            {!notModified && (
                <TouchableOpacity style={styles.add_picture} onPress={add_button}>
                    <IonIcons name={"image-outline"} size={28} color={colors.black}/>
                </TouchableOpacity>)}

            {/* -------------------- Bouton pour modifier les informations de la page -------------------- */}
            {notModified && (
            <TouchableOpacity onPress={() => isNotModified(!notModified)}>
                <View style={[styles.modify_button, styles.shadow, {backgroundColor: isDarkMode ? colors.modalSurface : colors.primary} ]}>
                    <Text style={{color: colors.white, textAlign: 'center'}}>Modifier</Text>
                </View>
            </TouchableOpacity>)}

            {/* -------------------- Section champs de texte -------------------- */}
            <View style={styles.input_field}>

                {/* -------------------- Champs pseudo -------------------- */}
                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? colors.white : colors.black}}> Pseudo</Text>
                    <TextInput
                        editable={!notModified}
                        style={[styles.input, {backgroundColor: notModified ? colors.surfaceLighter : colors.white}]}
                        placeholder="name123" defaultValue={pseudo_text}
                        onChangeText={pseudo_text_change}
                    />
                </View>
                
                {/* -------------------- Champs courriel -------------------- */}
                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? colors.white : colors.black}}> Courriel</Text>
                    <TextInput
                        editable={!notModified}
                        style={[styles.input, {backgroundColor: notModified ? colors.surfaceLighter : colors.white}]}
                        placeholder="example@gmail.com" defaultValue={email_text}
                        onChangeText={set_email_text}
                    />
                </View>

                {/* -------------------- Champs mot de passe -------------------- */}
                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? colors.white : colors.black}}> Mot de passe</Text>

                    <View style={{flexDirection: 'row', width: 100, alignItems:'center'}}>
                        <TextInput
                            editable={!notModified}
                        style={[styles.input, {backgroundColor: notModified ? colors.surfaceLighter : colors.white}]}
                            onChangeText={set_password_text}
                            value={password_text}
                            secureTextEntry={show_password}
                        />
                        <TouchableOpacity style={{ marginLeft:-40}}
                                        onPress={() => set_show_password(!show_password)}>
                            <IonIcons name={show_password ? "eye" : "eye-off"} size={28} color={colors.black}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                    {!notModified && !isPasswordCorrect && (
                    <Text style={{color: colors.error, marginTop:10}} >
                        Doit contenir  au minimum :
                    </Text>)}
                    {!notModified && !isPasswordCorrect && (
                    <Text style={{color: colors.error}}>
                        {'\u2022'} 8 caractères,{'\n'}
                        {'\u2022'} une majuscule, {'\n'}  
                        {'\u2022'} une minuscule, {'\n'}
                        {'\u2022'} un chiffre  {'\n'}
                    </Text>
                    )}
                    </View>
                </View>
            </View>
            {/* -------------------- Fin section champs de texte -------------------- */}
              {/* -------------------- Section boutons pour annuler/sauvegarder modif -------------------- */}
              <View style={{ marginTop:240, marginBottom: 10 }}>
                  <View>{!notModified && (<View style={[styles.drawHorLine, {width:width*0.75, backgroundColor: colors.modalSurface}]}></View>)}</View>

                  <View style={{flexDirection:'row',gap : "25%", alignSelf:'center'}}>
                      {!notModified && (
                          <TouchableOpacity style={[styles.modify_button, {marginTop: 0, top:0, backgroundColor: isDarkMode ? colors.modalSurface : colors.primary}]} onPress={pageCancel}>
                              <Text style={{color: colors.white, textAlign:'center'}}>Abandonner</Text>
                          </TouchableOpacity>)}

                      {!notModified && (
                          <TouchableOpacity style={[styles.modify_button, {marginTop: 0, top:0, backgroundColor:isDarkMode ?
                                  (isPasswordCorrect ? colors.modalSurface : colors.textMuted) : (isPasswordCorrect ? colors.primary : colors.textMuted)}]}
                                            onPress={pageSave} disabled={!isPasswordCorrect}>
                              <Text style={{color: colors.white, textAlign:'center'}}>Sauvegarder</Text>
                          </TouchableOpacity>)}

                  </View>

                  {/* Modals (/pop up) pour page si clique sur bouton abandonner ou sauvegarder les modifications */}
                  <Modal transparent visible={clickGiveUp} animationType='none' >
                      <View style={[stylesProfil.confPage, {backgroundColor: colors.modalOverlay}]}>

                          <View style={[stylesProfil.confContener, {backgroundColor: isDarkMode ? colors.modalSurface : colors.white}]}>
                              <Text style={[stylesProfil.confText, {color: isDarkMode ? colors.white : colors.black}]}>
                                  {textClick} </Text>

                              <View style={{flexDirection:'row', alignContent:'center', alignSelf:'center', gap : "15%", marginTop:40 }}>
                                  <TouchableOpacity style={[stylesProfil.clickButton,{backgroundColor: colors.timerAccent}]}
                                                    onPress={() => {isNotModified(!notModified), setClickGiveUp(!clickGiveUp), setPseudo(pseudo_text), setEmail(email_text), setPassword(password_text)}}>
                                      <Text style={[stylesProfil.confText, {color: isDarkMode ? colors.white : colors.black}]}> Oui </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={[stylesProfil.clickButton, {backgroundColor: isDarkMode ? colors.modalSurface : colors.white, borderColor: colors.border}]} onPress={()=>setClickGiveUp(!clickGiveUp)}>
                                      <Text style={[stylesProfil.confText, {color: isDarkMode ? colors.white : colors.black}]}> Non </Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>
                  </Modal>
                  <View>{!notModified && (<View style={[styles.drawHorLine, {width:width*0.75, backgroundColor: colors.modalSurface}]}></View>)}</View>

              </View>
              {/* -------------------- Fin section boutons pour annuler/sauvegarder modif -------------------- */}

    </ScrollView>
    )
}

{/* -------------------- Section Style -------------------- */}
const styles = StyleSheet.create({
    bodyStyle: {
        padding: 100,
        alignItems: "center",
        paddingBottom: 0
    },
    drawHorLine:{
        backgroundColor: colors.border,
        height:1,
        marginVertical: 10,
        width: '100%'
    },
    ImageProfile: {},
    image: {
        width: 120,
        height: 120
    },
    modify_button: {
        top: 10,
        marginTop: 10,
        padding: 10,
        borderRadius: 20,
        borderWidth: 0,
        minWidth: 130
    },
    add_picture: {
        borderColor: colors.textOnDark,
        borderWidth: 2,
        backgroundColor: colors.surfaceLighter,
        padding: 6,
        borderRadius: 20,
        marginTop:-40,
        marginLeft:90
    },
    input: {
        backgroundColor: colors.surfaceLighter,
        width: 300,
        borderRadius: 20,
        borderWidth: 1,
        padding: 10,
        flexGrow: 1
    },

    input_field: {
        height:50,
        marginBottom: 30,
    },
    box_input: {
        padding: 10,
    },
    shadow :{
        shadowColor: colors.black,
        shadowOpacity:0.1,
        shadowOffset: {
                width: 0,
                height:3,
        },
        elevation: 3   }
});
