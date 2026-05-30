import { View, Text } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { Image } from "expo-image";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <View>
        <Image
          source={require("../../assets/images/main.jpg")}
          style={globalStyles.backgroundImage}
          contentFit="cover"
        />
      </View>

      <Text style={globalStyles.text}>Hello, World!</Text>
    </View>
  );
}
