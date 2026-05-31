import { stackScreenOptions } from "@/styles/navigation";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ ...stackScreenOptions }}>
        <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/verify-otp"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
