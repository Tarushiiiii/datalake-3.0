import { View, TouchableOpacity, Text } from "react-native";
import { Link, Stack } from "expo-router";
import { globalStyles } from "@/styles/globalStyles";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <View style={globalStyles.container}>
        <Link href="/index" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Go back to Home screen!</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
