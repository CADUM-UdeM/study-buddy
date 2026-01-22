import { Stack } from "expo-router";
import { CoursesProvider } from "./context/CoursesContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SessionsProvider } from "./context/SessionsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SessionsProvider>
        <CoursesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </CoursesProvider>
      </SessionsProvider>
    </SettingsProvider>
  );
}
