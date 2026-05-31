import Attendance from "@/components/attendance";
import ScreenWrapper from "@/components/ScreenWrapper";
import { globalStyles } from "@/styles/globalStyles";
import { Text } from "react-native";

export default function AttendancePage() {
  return (
    <ScreenWrapper>
      <Text style={globalStyles.heroTitle}>Attendance Screen</Text>
      <Text style={globalStyles.text}>
        This is where the attendance marking functionality will be implemented.
      </Text>
      <Attendance />
    </ScreenWrapper>
  );
}
