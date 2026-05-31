import ScreenWrapper from "@/components/ScreenWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { profileHeaderStyle } from "../styles/navigation";

export default function Profile() {
  const [loggedIn, setLoggedIn] = useState(true);
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          console.log("User logged out");

          // [AUTH FLOW] Clear persisted login state
          await AsyncStorage.removeItem("isLoggedIn");

          // Update login state
          setLoggedIn(false);

          // [AUTH FLOW] Use replace() so tabs are removed from the stack.
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Profile",
            ...profileHeaderStyle,
            headerTitleAlign: "center",
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={globalStyles.text}>
            {loggedIn ? "Hello, World!" : "Logged Out"}
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{
              marginTop: 25,
              backgroundColor: "#ff4d4d",
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 10,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
