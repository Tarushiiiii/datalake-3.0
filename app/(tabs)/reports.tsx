import { Text, View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function Reports() {
  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        <Text style={globalStyles.text}>Reports screen</Text>
      </View>
    </ScreenWrapper>
  );
}
