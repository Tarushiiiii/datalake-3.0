import { View, Text } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { Image } from "expo-image";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function Index() {
  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        {/* <View>
          <Image
            source={require("../../assets/images/main.jpg")}
            style={globalStyles.backgroundImage}
            contentFit="cover"
          />
        </View> */}

        <Text style={globalStyles.text}>Hello, World!</Text>
      </View>
    </ScreenWrapper>
  );
}
