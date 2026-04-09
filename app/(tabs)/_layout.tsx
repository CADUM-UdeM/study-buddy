import IonIcons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

const isIOS26Plus =
  Platform.OS === "ios" && parseInt(Platform.Version as string, 10) >= 26;

export default function TabLayout() {
  if (isIOS26Plus) {
    return (
      <NativeTabs
        backgroundColor="#221F3D"
        iconColor={{ default: "#ffffff", selected: "#AB8BFF" }}
        labelStyle={{ fontFamily: "PixelJersey", fontSize: 12 }}
      >
        <NativeTabs.Trigger name="index">
          <Icon src={<VectorIcon family={IonIcons} name="home" />} />
          <Label>Accueil</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="donnees">
          <Icon src={<VectorIcon family={IonIcons} name="stats-chart" />} />
          <Label>Données</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="pomodoro">
          <Icon src={<VectorIcon family={IonIcons} name="alarm" />} />
          <Label>Pomodoro</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="parametres">
          <Icon src={<VectorIcon family={IonIcons} name="settings" />} />
          <Label>Paramètres</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="detailscours" hidden />
        <NativeTabs.Trigger name="notifications" hidden />
      </NativeTabs>
    );
  }

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#AB8BFF",
        tabBarInactiveTintColor: "#ffffff",
        tabBarStyle: { backgroundColor: "#221F3D" },
        tabBarLabelStyle: { fontFamily: "PixelJersey", fontSize: 11 },
        animation: "fade",
        sceneStyle: { backgroundColor: "#221F3D" },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <IonIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donnees"
        options={{
          title: "Données",
          tabBarIcon: ({ color }) => (
            <IonIcons name="stats-chart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: "Pomodoro",
          tabBarIcon: ({ color }) => (
            <IonIcons name="alarm" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => (
            <IonIcons name="settings" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="detailscours" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
