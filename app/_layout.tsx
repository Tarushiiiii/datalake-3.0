import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/index" />
          <Stack.Screen name="(auth)/verify-otp" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
