import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CoursesProvider } from "./context/CoursesContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SessionsProvider } from "./context/SessionsContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <SessionsProvider>
          <CoursesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </CoursesProvider>
        </SessionsProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
