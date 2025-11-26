import { Stack } from "expo-router";
import { CoursesProvider } from "./context/CoursesContext"; // adjust path

export default function RootLayout() {
  return (
    <CoursesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="donnees" />
        <Stack.Screen name="detailscours" />
      </Stack>
    </CoursesProvider>
  );
}
