import React from "react";
import { Text, View } from "react-native";

import ScreenWrapper from "@/components/ScreenWrapper";
import { globalStyles } from "../../styles/globalStyles";

export default function Index() {
  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        <Text style={globalStyles.text}>Hello, World!</Text>
      </View>
    </ScreenWrapper>
  );
}
