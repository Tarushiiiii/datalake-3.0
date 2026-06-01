import AttendanceCard from "@/components/attendanceCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAttendanceStore } from "@/store/attendanceStore";
import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function Sync() {
  const records = useAttendanceStore((s) => s.records);

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
          <Text style={{ color: colors.auxiliary2, fontSize: fonts.normal }}>
            No attendance records yet.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
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
