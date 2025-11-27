import IonIcons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";


export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme == 'dark';

    const [count, set_count] = React.useState(0);
    const isModified = count % 2 == 0;
    const  button_modified_text   = isModified ? 'Modifier' : 'Sauvegarder'

    const [pseudo_text, pseudo_text_change] = React.useState('Blabla');
    const [email_text, email_text_change] = React.useState('example@gmail.com');

    const [password, set_password] = React.useState('mdp123');
    const [show_password, set_show_password] = React.useState(true);
    const router = useRouter();

    const cancel_button = () => {
        Alert.alert(
            'Êtes-vous sûr(e) de vouloir annuler les modifications ?',
            undefined,
            [{
                text: 'Oui',
                style: 'cancel',
            }, {
                text: 'Non'
            },
            ])
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

    return (
        <ScrollView contentContainerStyle={styles.buttonStyle}>
            {isModified && (
                <TouchableOpacity style={styles.go_back_button} onPress={() => router.push("/profil")}>
                    <IonIcons name="return-down-back-outline" size={40} color={'black'}/>
                </TouchableOpacity>)}
            {!isModified && (
                <TouchableOpacity style={styles.cancel_modification} onPress={cancel_button}>
                    <Text>Abandonner</Text>
                </TouchableOpacity>)}


            <Text style={{color: isDarkMode ? 'white' : 'black'}}> StudyTracker </Text>
            <Text></Text>
            <Text style={{color: isDarkMode ? 'white' : 'black', fontSize: 20, fontWeight: 'bold'}}> Profil </Text>
            <Text></Text>
            <View style={styles.ImageProfile}>
                <Image source={require("../../assets/images/image-profile.png")} style={styles.image}></Image>
            </View>
            {!isModified && (
                <TouchableOpacity style={styles.add_picture} onPress={add_button}>
                    <IonIcons name={"image-outline"} size={28} color={'black'}/>
                </TouchableOpacity>)}
            <TouchableOpacity onPress={() => set_count(count + 1)}>
                <View style={[styles.modify_button, {backgroundColor: isModified ? '#67348B' : '#61C36E'}]}>
                    <Text style={{color: 'white', textAlign: 'center'}}>{button_modified_text}</Text>
                </View>

            </TouchableOpacity>

            <View style={styles.input_field}>
                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? 'white' : 'black'}}> Pseudo</Text>
                    <TextInput
                        editable={!isModified}
                        style={styles.input}
                        placeholder="name123" defaultValue={pseudo_text}
                        onChangeText={pseudo_text_change}
                    />
                </View>
                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? 'white' : 'black'}}> Courriel</Text>
                    <TextInput
                        editable={!isModified}
                        style={styles.input}
                        placeholder="example@gmail.com" defaultValue={email_text}
                        onChangeText={email_text_change}
                    />
                </View>

                <View style={styles.box_input}>
                    <Text style={{color: isDarkMode ? 'white' : 'black'}}> Mot de passe</Text>

                    <View style={{flexDirection: 'row', position: 'relative', width: '100%',}}>
                        <TextInput
                            editable={!isModified}
                            style={styles.input}
                            onChangeText={set_password}
                            value={password}
                            secureTextEntry={show_password}
                        />
                        <TouchableOpacity style={{position: 'absolute', right: 10, bottom: 10}}
                                        onPress={() => set_show_password(!show_password)}>
                            <IonIcons name={show_password ? "eye" : "eye-off"} size={28} color={'black'}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                    <Text style={{color: 'red'}} >
                        Doit contenir :
                    </Text>
                    <Text style={{color: 'red'}}>
                        {'\u2022'} au minimum 8 caractères,{'\n'} 
                        {'\u2022'} une majuscule, {'\n'}  
                        {'\u2022'} une minuscule, {'\n'}
                        {'\u2022'} un caractère special {'\n'}
                    </Text>

                    </View>
                </View>

            </View>

    </ScrollView>
    )
}


const styles = StyleSheet.create({
    buttonStyle: {
        padding: 100,
        alignItems: "center",

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
        width: '100%',
        borderRadius: 20,
        borderWidth: 0,
        minWidth: 130

    },
    go_back_button: {
        backgroundColor: '#C2E5FF',
        width: '30%',
        padding: 10,
        position: 'absolute',
        top: 60,
        right: '155%',
        borderRadius: 20,

    },
    cancel_modification: {
        backgroundColor: 'red',
        width: '50%',
        right: '140%',
        padding: 10,
        position: 'absolute',
        top: 60,
    },
    add_picture: {
        backgroundColor: 'grey',
        padding: 10,
        borderRadius: 20,
        position: 'absolute',
        top: '100%',
        left: '105%',

    },
    input: {
        backgroundColor: '#D9D9D9',
        width: 300,
        borderRadius: 20,
        borderWidth: 1,
        padding: 10,
        flex: 1
    },

    input_field: {
        position: 'absolute',
        top: '145%',
        left: '20%'
    },
    box_input: {
        padding: 10,

    },
});
