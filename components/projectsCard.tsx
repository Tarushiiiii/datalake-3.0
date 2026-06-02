import type { ProjectWithDerived } from "@/store/projectStore";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  project: ProjectWithDerived;
}

export default function ProjectCard({ project }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasActiveSessions = project.sessions.some((s) => !s.checkOutTime);

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{project.siteName}</Text>
          <Text style={styles.location}>📍 {project.location}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            project.status === "completed" && styles.badgeCompleted,
            project.status === "in_progress" && styles.badgeInProgress,
            project.status === "pending" && styles.badgePending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              project.status === "completed" && styles.statusTextCompleted,
              project.status === "in_progress" && styles.statusTextInProgress,
              project.status === "pending" && styles.statusTextPending,
            ]}
          >
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
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  location: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  badgeCompleted: { backgroundColor: "#DCFCE7" },
  badgeInProgress: { backgroundColor: "#DBEAFE" },
  badgePending: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 11, fontWeight: "600" },
  statusTextCompleted: { color: "#16A34A" },
  statusTextInProgress: { color: "#2563EB" },
  statusTextPending: { color: "#6B7280" },

  // ── Progress ──
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  percent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366F1",
  },
  track: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    backgroundColor: "#6366F1",
    borderRadius: 999,
  },
  remaining: {
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },

  // ── Sessions ──
  sessionsToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sessionsToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
  },
  chevron: {
    fontSize: 10,
    color: "#6366F1",
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
    color: "#6B7280",
    fontWeight: "500",
  },
  sessionTime: {
    fontSize: 12,
    color: "#374151",
  },
  sessionRight: {
    alignItems: "flex-end",
  },
  sessionHours: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  sessionSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sessionSubtotalLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  sessionSubtotalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
});
