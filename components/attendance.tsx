import { useAttendanceStore } from "@/store/attendanceStore";
import { globalStyles } from "@/styles/globalStyles";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());

  const handleMark = async () => {
    try {
      setLoading(true);
      router.push({ pathname: "/attendance-camera" });
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
        {loading ? "Please wait..." : "Check In"}
      </Text>
    </TouchableOpacity>
  );
}
