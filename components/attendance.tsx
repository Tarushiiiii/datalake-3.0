import { globalStyles } from "@/styles/globalStyles";
import { Text, View } from "react-native";

export default function Attendance() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.heroTitle}>Attendance Screen</Text>
      <Text style={globalStyles.text}>
        This is where the attendance marking functionality will be implemented.
      </Text>
    </View>
  );
}
