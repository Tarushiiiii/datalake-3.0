import ProfileHeader from "@/components/profileHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const isMarkedToday = useAttendanceStore((s) => s.isMarkedToday());
  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());
  const checkOut = useAttendanceStore((s) => s.checkOut);
  const weeklyCount = useAttendanceStore((s) => s.weeklyCount());
  const weeklyHours = useAttendanceStore((s) => s.weeklyHours());

  return (
    <ScreenWrapper>
      {/* Top sync banner */}
      <View style={globalStyles.syncBanner}>
        <MaterialCommunityIcons
          name="cloud-sync-outline"
          size={16}
          color={colors.white}
        />
        <Text style={globalStyles.syncText}>Sync Status: Up to date</Text>
      </View>

      {/* Profile Header */}
      <ProfileHeader />

      {/* Attendance Card */}
      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Today's Attendance</Text>
        <Text style={globalStyles.cardDate}>{today}</Text>

        {/* Status Block */}
        <View style={globalStyles.statusBlock}>
          {isMarkedToday ? (
            <>
              {isCheckedInToday ? (
                <View
                  style={[
                    globalStyles.statusIconCircle,
                    { backgroundColor: "#D4EDDA", borderColor: colors.success },
                  ]}
                >
                  <Ionicons name="checkmark" size={32} color={colors.success} />
                </View>
              ) : (
                <View
                  style={[
                    globalStyles.statusIconCircle,
                    { backgroundColor: "#FFF3CD", borderColor: colors.warning },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={32}
                    color={colors.warning}
                  />
                </View>
              )}
              <Text
                style={[
                  globalStyles.statusLabel,
                  { color: isCheckedInToday ? colors.success : colors.warning },
                ]}
              >
                {isCheckedInToday ? "Checked In" : "Checked Out"}
              </Text>
              <Text style={globalStyles.statusDescription}>
                {isCheckedInToday
                  ? "You are currently checked in at your site."
                  : "You have checked out. Check in again if you've moved to another site."}
              </Text>
            </>
          ) : (
            <>
              <View
                style={[
                  globalStyles.statusIconCircle,
                  { backgroundColor: "#F8D7DA", borderColor: colors.danger },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={32}
                  color={colors.danger}
                />
              </View>
              <Text
                style={[globalStyles.statusLabel, { color: colors.danger }]}
              >
                Not Marked
              </Text>
              <Text style={globalStyles.statusDescription}>
                Your attendance has not been logged for today. Please check-in
                from your site.
              </Text>
            </>
          )}
        </View>

        {/* GPS Site Row */}
        <View style={globalStyles.siteRow}>
          <Ionicons
            name="navigate-outline"
            size={18}
            color={colors.auxiliary2}
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={globalStyles.siteName}>
              Site: Sector 18 Road Expansion
            </Text>
            <Text style={globalStyles.gpsAccuracy}>
              GPS Accuracy: <Text style={globalStyles.gpsHigh}>High (4m)</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Buttons */}
      {!isCheckedInToday && (
        <TouchableOpacity
          style={[
            globalStyles.button,
            { flexDirection: "row", justifyContent: "center" },
          ]}
          activeOpacity={0.85}
          onPress={() => router.push("/attendance")}
        >
          <Ionicons
            name="finger-print"
            size={22}
            color={colors.white}
            style={{ marginRight: 10 }}
          />
          <Text style={globalStyles.buttonText}>
            {isMarkedToday ? "Mark Attendance (New Site)" : "Check In"}
          </Text>
        </TouchableOpacity>
      )}

      {isCheckedInToday && (
        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonDanger,
            { flexDirection: "row", justifyContent: "center" },
          ]}
          activeOpacity={0.85}
          onPress={checkOut}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.white}
            style={{ marginRight: 10 }}
          />
          <Text style={globalStyles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      )}

      {/* Stats Row */}
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
    </ScreenWrapper>
  );
}
