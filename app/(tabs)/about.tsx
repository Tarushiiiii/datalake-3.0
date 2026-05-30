import { Text, View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";

export default function AboutScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>About screen</Text>
    </View>
  );
}
