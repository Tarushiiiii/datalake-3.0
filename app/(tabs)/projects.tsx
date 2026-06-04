import ProjectCard from "@/components/projectsCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import WeeklySummary from "@/components/weeklySummary";

import { useAttendanceStore } from "@/store/attendanceStore";
import { useProjectStore } from "@/store/projectStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function Projects() {
  const attendanceReady = useAttendanceStore((s) => s.isReady);
  const projectsReady = useProjectStore((s) => s.isReady);
  const initAttendance = useAttendanceStore((s) => s.init);
  const initProjects = useProjectStore((s) => s.init);

  // Subscribe to raw slices so the component re-renders whenever either
  // store changes — records drive completedHours, projects drive the list.
  const records = useAttendanceStore((s) => s.records);
  const rawProjects = useProjectStore((s) => s.projects);

  // Selector reference (stable, no need to subscribe to it directly)
  const getAllProjectsWithDerived = useProjectStore(
    (s) => s.getAllProjectsWithDerived,
  );

  // Initialise stores on mount if not already loaded
  useEffect(() => {
    if (!attendanceReady) initAttendance();
  }, [attendanceReady]);

  useEffect(() => {
    if (!projectsReady) initProjects();
  }, [projectsReady]);

  const isReady = attendanceReady && projectsReady;

  // Recompute derived list on every render (records / rawProjects changing
  // already causes a re-render via the subscriptions above).
  const projects = isReady ? getAllProjectsWithDerived() : [];

  console.log(
    "[Projects] records:",
    records.length,
    "rawProjects:",
    rawProjects.length,
    "derived:",
    projects.length,
  );

  if (!isReady) {
    return (
      <ScreenWrapper scroll={false}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <Text
        style={[
          globalStyles.cardTitle,
          { color: colors.primary, marginBottom: 12 },
        ]}
      >
        Weekly Summary:
      </Text>

      <WeeklySummary />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 16 }}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.primary,
              textAlign: "center",
              marginTop: 32,
              opacity: 0.6,
            }}
          >
            No site projects yet.{"\n"}Check in at a site to create one.
          </Text>
        }
      />
    </ScreenWrapper>
  );
}
