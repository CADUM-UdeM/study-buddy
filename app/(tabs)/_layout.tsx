import IonIcons from "@expo/vector-icons/Ionicons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#221F3D"
      iconColor={{ default: "#ffffff", selected: "#AB8BFF" }}
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
