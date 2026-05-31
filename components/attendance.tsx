import { useAttendanceStore } from "@/store/attendanceStore";
import { globalStyles } from "@/styles/globalStyles";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const markAttendance = useAttendanceStore((state) => state.markAttendance);

  const handleMarkAttendance = async () => {
    // ml integration will go here. For now, we simulate with a timeout.

    try {
      setLoading(true);

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      markAttendance();
      Alert.alert("Success", "Marked Attendance successfully.");
      router.push("/(tabs)");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <TouchableOpacity
      style={globalStyles.button}
      onPress={handleMarkAttendance}
      disabled={loading}
    >
      <Text style={globalStyles.buttonText}>
        {loading ? "Marking..." : "Mark Attendance"}
      </Text>
    </TouchableOpacity>
  );
}
