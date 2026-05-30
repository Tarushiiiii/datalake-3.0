import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

import { globalStyles } from "@/styles/globalStyles";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={globalStyles.safeContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
