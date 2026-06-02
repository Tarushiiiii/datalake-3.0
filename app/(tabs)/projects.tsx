import ProjectCard from "@/components/projectsCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import WeeklySummary from "@/components/weeklySummary";

import { useProjectStore } from "@/store/projectStore";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import { FlatList, Text } from "react-native";

export default function Projects() {
  const getAllProjectsWithDerived = useProjectStore(
    (s) => s.getAllProjectsWithDerived,
  );

  const projects = getAllProjectsWithDerived();

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
      />
    </ScreenWrapper>
  );
}
