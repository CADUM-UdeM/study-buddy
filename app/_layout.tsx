import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CoursesProvider } from "./context/CoursesContext"; // adjust path
import { SettingsProvider } from "./context/SettingsContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SettingsProvider>
          <CoursesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </CoursesProvider>
        </SettingsProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
