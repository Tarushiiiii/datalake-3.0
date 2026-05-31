import ScreenWrapper from "@/components/ScreenWrapper";
import { globalStyles } from "@/styles/globalStyles";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Attendance() {
  return (
    <SafeAreaProvider>
      <ScreenWrapper>
        <View style={globalStyles.safeContainer}>
          <Text style={globalStyles.heroTitle}>Attendance Screen</Text>
          <Text style={globalStyles.text}>
            This is where the attendance marking functionality will be
            implemented.
          </Text>
        </View>
      </ScreenWrapper>
    </SafeAreaProvider>
  );
}
