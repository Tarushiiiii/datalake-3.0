import type { ProjectWithDerived } from "@/store/projectStore";
import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  project: ProjectWithDerived;
}

export default function ProjectCard({ project }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasActiveSessions = project.sessions.some((s) => !s.checkOutTime);

  return (
    <View style={globalStyles.card}>
      {/* ── Header ── */}
      <View style={globalStyles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.cardTitle}>{project.siteName}</Text>
          <Text style={globalStyles.siteName}>
            <Ionicons
              name="navigate-outline"
              size={18}
              color={colors.auxiliary2}
              style={{ marginRight: 8 }}
            />{" "}
            {project.location}
          </Text>
        </View>

        <View
          style={[
            globalStyles.statusBadge,
            project.status === "completed" && {
              backgroundColor: colors.completed,
            },
            project.status === "in_progress" && {
              backgroundColor: colors.inProgress,
            },
            project.status === "pending" && { backgroundColor: colors.pending },
            { opacity: 0.8 },
          ]}
        >
          <Text style={[globalStyles.statusText, { fontSize: fonts.xs }]}>
            {project.status === "completed"
              ? "Completed"
              : project.status === "in_progress"
                ? hasActiveSessions
                  ? "Active"
                  : "In Progress"
                : "Pending"}
          </Text>
        </View>
      </View>

      {/* ── Progress ── */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {project.completedHours}h / {project.assignedHours}h
        </Text>
        <Text style={styles.percent}>{project.progressPercent}%</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${project.progressPercent}%` },
            project.status === "completed" && { backgroundColor: "#22C55E" },
          ]}
        />
      </View>

      <Text style={styles.remaining}>
        {project.status === "completed"
          ? "All hours completed ✓"
          : `${project.remainingHours}h remaining`}
      </Text>

      {/* ── Sessions toggle ── */}
      {project.sessions.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.sessionsToggle}
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.sessionsToggleText}>
              {expanded ? "Hide" : "Show"} sessions ({project.sessions.length})
            </Text>
            <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.sessionsList}>
              {project.sessions.map((session, i) => (
                <View key={session.checkInTime} style={styles.sessionRow}>
                  <View style={styles.sessionLeft}>
                    <Text style={styles.sessionDate}>{session.date}</Text>
                    <Text style={styles.sessionTime}>
                      {formatTime(session.checkInTime)}
                      {" → "}
                      {session.checkOutTime
                        ? formatTime(session.checkOutTime)
                        : "ongoing"}
                    </Text>
                  </View>
                  <View style={styles.sessionRight}>
                    {session.checkOutTime ? (
                      <Text style={styles.sessionHours}>{session.hours}h</Text>
                    ) : (
                      <View style={styles.activeDot} />
                    )}
                  </View>
                </View>
              ))}

              {/* Sessions subtotal */}
              <View style={styles.sessionSubtotal}>
                <Text style={styles.sessionSubtotalLabel}>Total logged</Text>
                <Text style={styles.sessionSubtotalValue}>
                  {project.completedHours}h
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

const styles = StyleSheet.create({
  // ── Progress ──
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.auxiliary2,
  },
  percent: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  track: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  remaining: {
    marginTop: 8,
    fontSize: 12,
    color: colors.auxiliary,
  },

  // ── Sessions ──
  sessionsToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.shadow,
  },
  sessionsToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  chevron: {
    fontSize: 10,
    color: colors.primary,
  },
  sessionsList: {
    marginTop: 10,
    gap: 8,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sessionLeft: {
    gap: 2,
  },
  sessionDate: {
    fontSize: 11,
    color: colors.auxiliary,
    fontWeight: "500",
  },
  sessionTime: {
    fontSize: 12,
    color: colors.auxiliary2,
  },
  sessionRight: {
    alignItems: "flex-end",
  },
  sessionHours: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.auxiliary2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  sessionSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.shadow,
  },
  sessionSubtotalLabel: {
    fontSize: 12,
    color: colors.auxiliary,
    fontWeight: "500",
  },
  sessionSubtotalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
