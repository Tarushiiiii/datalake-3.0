import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens are grouped; each uses replace() so they don't stack */}
      <Stack.Screen name="(auth)/index" />
      <Stack.Screen name="(auth)/verify-otp" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
