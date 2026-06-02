import { useAttendanceStore } from "@/store/attendanceStore";
import { globalStyles } from "@/styles/globalStyles";
import React from "react";
import { Text, View } from "react-native";

const WeeklySummary = () => {
  const weeklyCount = useAttendanceStore((s) => s.weeklyCount());
  const weeklyHours = useAttendanceStore((s) => s.weeklyHours());

  return (
    <View style={globalStyles.statsRow}>
      <View style={globalStyles.statCard}>
        <Text style={globalStyles.statLabel}>THIS WEEK</Text>
        <Text style={globalStyles.statValue}>{weeklyCount} / 5</Text>
        <Text style={globalStyles.statSub}>Days Present</Text>
      </View>
      <View style={globalStyles.statCard}>
        <Text style={globalStyles.statLabel}>TOTAL HOURS</Text>
        <Text style={globalStyles.statValue}>{weeklyHours}</Text>
        <Text style={globalStyles.statSub}>Working Hours</Text>
      </View>
    </View>
  );
};

export default WeeklySummary;
