import { useEffect, useState } from "react";

import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import Ionicons from "@expo/vector-icons/Ionicons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (loggedIn === "true") {
        // Already logged in — replace so back button cannot return here
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setLoading(true);

      // Simulated API delay — replace with real OTP request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "OTP sent successfully.");

      // [AUTH FLOW] Use replace() so Login screen is removed from the stack.
      // The user cannot press back from OTP screen to return to Login.
      router.replace({
        pathname: "/(auth)/verify-otp",
        params: { phone },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View
        style={[globalStyles.container, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../../assets/images/main.jpg")}
        resizeMode="cover"
        style={globalStyles.backgroundImage}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* OVERLAY */}
            <View style={globalStyles.overlay}>
              {/* HEADER */}
              <View style={globalStyles.header}>
                <Image
                  source={require("../../assets/images/mrth.png")}
                  style={globalStyles.logo}
                />
                <TouchableOpacity style={{ padding: 6 }}>
                  <Ionicons name="menu" size={34} color={colors.black} />
                </TouchableOpacity>
              </View>

              {/* HERO SECTION */}
              <View style={globalStyles.heroContainer}>
                <Text style={globalStyles.heroSubtitle}>Welcome to</Text>
                <Text style={globalStyles.heroTitle}>DataLake 3.0</Text>
              </View>

              {/* LOGIN CARD */}
              <View style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>Login</Text>

                <Text style={globalStyles.label}>
                  Registered Mobile Number *
                </Text>

                <TextInput
                  placeholder="Enter Mobile Number"
                  placeholderTextColor={colors.shadow}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  style={globalStyles.input}
                />

                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={globalStyles.buttonText}>
                    {loading ? "Sending OTP..." : "Login using OTP"}
                  </Text>
                </TouchableOpacity>

                <Text style={globalStyles.helpText}>
                  Having trouble logging in?{" "}
                  <Text style={globalStyles.helpLink}>Get Help</Text>
                </Text>

                {/* FOOTER */}
                <View style={globalStyles.footer}>
                  <Text style={globalStyles.footerText}>powered by </Text>
                  <Image
                    source={require("../../assets/images/dic.png")}
                    style={{ width: 100, height: 40, resizeMode: "contain" }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}
