/**
 * attendance.tsx
 *
 * Landing screen for the attendance feature.
 * Shows today's status and a single CTA that launches the camera flow.
 */

import { useAttendanceStore } from "@/store/attendanceStore";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AttendancePage() {
  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());
  const weeklyCount = useAttendanceStore((s) => s.weeklyCount());
  const weeklyHours = useAttendanceStore((s) => s.weeklyHours());

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Attendance</Text>

      {/* Weekly summary */}
      <View style={styles.statsRow}>
        <StatCard label="Days This Week" value={String(weeklyCount)} />
        <StatCard label="Hours This Week" value={`${weeklyHours}h`} />
      </View>

      {/* Status badge */}
      <View
        style={[
          styles.statusBadge,
          isCheckedInToday ? styles.statusBadgeIn : styles.statusBadgeOut,
        ]}
      >
        <Text style={styles.statusDot}>{isCheckedInToday ? "●" : "○"}</Text>
        <Text style={styles.statusText}>
          {isCheckedInToday ? "Currently Checked In" : "Not Checked In Today"}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Verification Steps</Text>
        {[
          {
            n: "01",
            label: "Head Movement",
            sub: "Turn your head left and right",
          },
          {
            n: "02",
            label: "Blink Detection",
            sub: "Blink 2–3 times naturally",
          },
          {
            n: "03",
            label: "Face Recognition",
            sub: "Hold still for face match",
          },
        ].map(({ n, label, sub }) => (
          <View key={n} style={styles.stepRow}>
            <Text style={styles.stepN}>{n}</Text>
            <View>
              <Text style={styles.stepLabel}>{label}</Text>
              <Text style={styles.stepSub}>{sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, isCheckedInToday && styles.ctaOut]}
        onPress={() => router.push("/attendance-camera")}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>
          {isCheckedInToday ? "Check Out" : "Check In"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Remove glasses before scanning for best results.
      </Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a14",
    padding: 24,
    paddingTop: 60,
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
  },
  statValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  statusBadgeIn: { backgroundColor: "rgba(16,185,129,0.15)" },
  statusBadgeOut: { backgroundColor: "rgba(255,255,255,0.05)" },
  statusDot: { fontSize: 12, color: "#10B981" },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  stepsCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    gap: 16,
  },
  stepsTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  stepN: {
    color: "#60A5FA",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 2,
    width: 22,
  },
  stepLabel: { color: "#fff", fontSize: 14, fontWeight: "600" },
  stepSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  cta: {
    backgroundColor: "#60A5FA",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaOut: { backgroundColor: "#F87171" },
  ctaText: { color: "#000", fontSize: 17, fontWeight: "800" },
  hint: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    textAlign: "center",
  },
});
