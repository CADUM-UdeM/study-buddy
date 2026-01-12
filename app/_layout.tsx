import { Stack } from "expo-router";
import { CoursesProvider } from "./context/CoursesContext"; // adjust path

export default function RootLayout() {
  return (
    <CoursesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </CoursesProvider>
  );
}
