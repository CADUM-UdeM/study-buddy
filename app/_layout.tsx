import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CoursesProvider } from "./context/CoursesContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SessionsProvider } from "./context/SessionsContext";
import { useFonts} from "expo-font"
/** Core app background — matches tab bar; used as React Navigation default so fades don’t flash light gray/white. */
const CORE_BACKGROUND = "#221F3D";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: CORE_BACKGROUND,
    card: CORE_BACKGROUND,
  },
};

export default function RootLayout() {
    const [fonts] = useFonts({
        PixelBold: require("../assets/fonts/PixelifySans-Bold.ttf"),
        PixelMedium: require("../assets/fonts/PixelifySans-Medium.ttf"),
        PixelRegular: require("../assets/fonts/PixelifySans-Regular.ttf"),
        PixelSemiBold: require("../assets/fonts/PixelifySans-SemiBold.ttf"),
    });
    if (!fonts) {
        return null;
    }
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: CORE_BACKGROUND }}
    >
      <ThemeProvider value={navigationTheme}>
        <SettingsProvider>
          <SessionsProvider>
            <CoursesProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </CoursesProvider>
          </SessionsProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}