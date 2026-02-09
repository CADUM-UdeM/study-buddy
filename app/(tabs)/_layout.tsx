import IonIcons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { colors } from "../theme/colors";

const TAB_ICON_SIZE = 26;

function TabIcon({
  name,
  size = TAB_ICON_SIZE,
  color,
  focused,
}: {
  name: keyof typeof IonIcons.glyphMap;
  size?: number;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: focused ? colors.primary + "40" : "transparent",
      }}
    >
      <IonIcons name={name} size={size} color={color} />
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: 24,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.tabBarActive,
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.darkAmethyst2,
          shadowColor: colors.black,
        },
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="parametres"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" size={28} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="donnees"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="stats-chart" size={25} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" size={28} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="alarm" size={28} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" size={28} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="detailscours" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profil_info" options={{ href: null }} />
    </Tabs>
  );
}
