import { Text, View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function Sync() {
  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        <Text style={globalStyles.text}>Sync screen</Text>
      </View>
    </ScreenWrapper>
  );
}
