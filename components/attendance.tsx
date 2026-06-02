import { useAttendanceStore } from "@/store/attendanceStore";
import { globalStyles } from "@/styles/globalStyles";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const checkIn = useAttendanceStore((s) => s.checkIn);
  const checkOut = useAttendanceStore((s) => s.checkOut);
  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());

  const handleMark = async () => {
    try {
      setLoading(true);

      // Simulated API delay — replace with real ML/API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/attendance-camera");

      // if (isCheckedInToday) {
      //   checkOut();
      //   Alert.alert("Checked Out", "Your hours have been logged.");
      // } else {
      //   checkIn();
      //   Alert.alert("Checked In", "Attendance marked successfully.");
      // }

      // router.push("/(tabs)");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={globalStyles.button}
      onPress={handleMark}
      disabled={loading}
    >
      <Text style={globalStyles.buttonText}>
        {loading
          ? "Please wait..."
          : isCheckedInToday
            ? "Check Out"
            : "Check In"}
      </Text>
    </TouchableOpacity>
  );
}
