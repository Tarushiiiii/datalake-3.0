// app/_layout.tsx
import { useEffect } from "react";
import { stackScreenOptions } from "@/styles/navigation";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useProjectStore } from "@/store/projectStore";

export default function RootLayout() {
  const attendanceInit = useAttendanceStore((s) => s.init);
  const projectInit = useProjectStore((s) => s.init);

  useEffect(() => {
    attendanceInit();
    projectInit();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ ...stackScreenOptions }}>
        <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
      </Stack>
    </SafeAreaProvider>
  );
}