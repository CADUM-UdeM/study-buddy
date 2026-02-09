import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="parametres" />
      <Tabs.Screen name="donnees" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="pomodoro" />
      <Tabs.Screen name="profil" />
      <Tabs.Screen name="detailscours" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profil_info" options={{ href: null }} />
    </Tabs>
  );
}
