import ScreenWrapper from "@/components/ScreenWrapper";
import { Text } from "react-native";
import { globalStyles } from "../../styles/globalStyles";

export default function Sync() {
  return (
    <ScreenWrapper>
      <Text style={globalStyles.text}>Sync screen</Text>
    </ScreenWrapper>
  );
}
