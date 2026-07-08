import IonIcons from "@expo/vector-icons/Ionicons";
import {Tabs} from "expo-router";
import {Icon, Label, NativeTabs, VectorIcon} from "expo-router/unstable-native-tabs";
import {Platform, View} from "react-native";
import {darkTheme, lightTheme} from "@/components/colors";
import {useSettings} from "@/app/context/SettingsContext";
import {NavBar} from "@/components/NavBarAnimation";

const isIOS26Plus =
    Platform.OS === "ios" && parseInt(Platform.Version as string, 10) >= 26;


export default function TabLayout() {
    const {settings} = useSettings();
    /* Appliquer la couleur du theme */
    const theme = settings.isDarkMode ? darkTheme : lightTheme;

    if (isIOS26Plus) {
        return (
            <NativeTabs
                backgroundColor= {theme.background}
                iconColor={{
                    default: theme.inactiveColorIcon,
                    selected: theme.activeColorIcon,
                }}
                labelStyle={{fontFamily: "PixelJersey", fontSize: 12}}
            >
                <NativeTabs.Trigger name="index">
                    <Icon src={<VectorIcon family={IonIcons} name="home"/>}/>
                    <Label>Accueil</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="donnees">
                    <Icon src={<VectorIcon family={IonIcons} name="stats-chart"/>}/>
                    <Label>Données</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="pomodoro">
                    <Icon src={<VectorIcon family={IonIcons} name="alarm"/>}/>
                    <Label>Pomodoro</Label>
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="parametres">
                    <Icon src={<VectorIcon family={IonIcons} name="settings"/>}/>
                    <Label>Paramètres</Label>
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    }

    return (
        <Tabs
            detachInactiveScreens={false}
            screenOptions={{
                headerShown: false,

                /* Animation */
                animation: "fade",
                sceneStyle: {backgroundColor: theme.background,
                    flex: 1,
                },
            }}
            tabBar={({state, navigation}) => {
                const currentRouteName = state.routes[state.index].name;

                const handleTabPress = (routeName: string) => {
                    const event = navigation.emit({
                        type: 'tabPress', target: routeName, canPreventDefault: true,
                    });
                    if (!event.defaultPrevented) {
                        navigation.navigate(routeName);
                    }
                };

                return (
                    <View style={{
                        position: 'absolute', bottom: 0,
                        left: 0, right: 0, backgroundColor: 'transparent'
                    }}>
                        <NavBar dark={settings.isDarkMode}
                                currentActive={currentRouteName} onTabPress={handleTabPress} theme={theme}/>
                    </View>
                );
            }}>
            <Tabs.Screen name="index" options={{title: "Accueil"}}/>
            <Tabs.Screen name="donnees" options={{title: "Données"}}/>
            <Tabs.Screen name="pomodoro" options={{title: "Pomodoro"}}/>
            <Tabs.Screen name="parametres" options={{title: "Paramètres"}}/>
        </Tabs>
    );
}
