import ProfileHeader from "@/components/profileHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { globalStyles } from "@/styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

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
      <ProfileHeader />
      <TouchableOpacity
        onPress={handleLogout}
        style={[globalStyles.button, globalStyles.buttonDanger]}
      >
        <Text style={globalStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
