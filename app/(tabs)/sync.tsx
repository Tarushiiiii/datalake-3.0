import AttendanceCard from "@/components/attendanceCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import SyncStatus from "@/components/syncStatus";
import { AWS_CONFIG } from "@/services/config";
import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Sync() {
  const records = useAttendanceStore((s) => s.records);

  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.checkInTime).getTime() -
      new Date(a.checkInTime).getTime()
  );

  

  if (sorted.length === 0) {
    return (
      <ScreenWrapper>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={48}
            color={colors.auxiliary2}
          />

          <Text
            style={{
              color: colors.auxiliary2,
              fontSize: fonts.normal,
            }}
          >
            No attendance records yet.
          </Text>

          
        </View>
      </ScreenWrapper>
    );
  }

  const totalRecords = sorted.length;
  const syncedRecords = sorted.filter(
    (r) => r.isSynced
  ).length;

  return (
    <ScreenWrapper>
      <SyncStatus />

      <View style={globalStyles.statsRow}>
        <View style={globalStyles.statCard}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={32}
            color={colors.success}
          />

          <Text style={globalStyles.statValue}>
            {syncedRecords}
          </Text>

          <Text style={globalStyles.statLabel}>
            Synced
          </Text>
        </View>

        <View style={globalStyles.statCard}>
          <Ionicons
            name="hourglass-outline"
            size={32}
            color={colors.warning}
          />

          <Text style={globalStyles.statValue}>
            {totalRecords - syncedRecords}
          </Text>

          <Text style={globalStyles.statLabel}>
            Pending
          </Text>
        </View>
      </View>

      

      <Text
        style={[
          globalStyles.cardTitle,
          {
            color: colors.primary,
            marginTop: 12,
          },
        ]}
      >
        Records:
      </Text>

      {sorted.map((record, index) => (
        <AttendanceCard
          key={`${record.date}-${index}`}
          date={record.date}
          checkInTime={record.checkInTime}
          checkOutTime={record.checkOutTime}
          siteName={record.siteName ?? "Unknown Site"}
          isSynced={record.isSynced}
        />
      ))}
    </ScreenWrapper>
  );
}