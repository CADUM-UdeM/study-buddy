import { Stack } from "expo-router";
import { CoursesProvider } from "./context/CoursesContext";
import { SettingsProvider } from "./context/SettingsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <CoursesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </CoursesProvider>
    </SettingsProvider>
  );
}
