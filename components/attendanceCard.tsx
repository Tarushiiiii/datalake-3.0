import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type AttendanceStatus = "synced" | "pending";

interface AttendanceCardProps {
  date: string; // ISO datetime e.g. "2023-10-24T08:45:00.000Z"
  checkInTime: string;
  checkOutTime?: string | null;
  siteName: string;
  isSynced?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ isSynced }: { isSynced: boolean }) {
  return (
    <View
      style={[
        globalStyles.statusBadge,
        { backgroundColor: isSynced ? colors.success : colors.warning },
      ]}
    >
      <Ionicons
        name={isSynced ? "checkmark-circle" : "document-outline"}
        size={13}
        style={{ marginRight: 4 }}
        color={colors.white}
      />
      <Text style={[globalStyles.syncText, { fontSize: fonts.sm }]}>
        {isSynced ? "Synced" : "Pending"}
      </Text>
    </View>
  );
}

export default function AttendanceCard({
  date,
  checkInTime,
  checkOutTime,
  siteName,
  isSynced = false,
}: AttendanceCardProps) {
  const displayTime = checkOutTime
    ? `${formatTime(checkInTime)} – ${formatTime(checkOutTime)}`
    : formatTime(checkInTime);

  return (
    <View style={globalStyles.card}>
      {/* Row 1: Date + Status Badge */}
      <View style={globalStyles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <StatusBadge isSynced={isSynced} />
      </View>

      {/* Row 2: Check-in / Check-out time */}
      <View style={globalStyles.cardTime}>
        <Ionicons
          name="time-outline"
          size={14}
          color={colors.auxiliary2}
          style={{ marginRight: 5 }}
        />
        <Text style={globalStyles.cardDate}>{displayTime}</Text>
      </View>

      {/* Divider */}
      <View style={globalStyles.divider} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="location-outline"
          size={fonts.normal}
          color={colors.auxiliary2}
          style={{ marginRight: 5 }}
        />
        <Text style={[globalStyles.siteName, { fontSize: fonts.normal }]}>
          {siteName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateText: {
    fontSize: fonts.mainLabel,
    fontWeight: "700",
    color: colors.primary,
  },
});
