import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CoursesProvider } from "./context/CoursesContext";
import { SessionsProvider } from "./context/SessionsContext";
import { SettingsProvider } from "./context/SettingsContext";

const JETBRAINS_MONO_NERD_URL =
  "https://cdn.jsdelivr.net/gh/ryanoasis/nerd-fonts@master/patched-fonts/JetBrainsMono/Regular/complete/JetBrains%20Mono%20Regular%20Nerd%20Font%20Complete.ttf";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Font.loadAsync({
      JetBrainsMonoNerdFont: { uri: JETBRAINS_MONO_NERD_URL },
    })
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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