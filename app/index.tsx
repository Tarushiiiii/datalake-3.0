import { useState } from "react";

import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import Ionicons from "@expo/vector-icons/Ionicons";

import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import {
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

export default function HomeScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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

      console.log("Sending OTP to:", phone);

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "OTP sent successfully.");

      // Navigate to OTP screen later
      router.push("/verify-otp");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../assets/images/main.jpg")}
        resizeMode="cover"
        style={globalStyles.backgroundImage}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  source={require("../assets/images/mrth.png")}
                  style={{ width: 120, height: 50, resizeMode: "contain" }}
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
                    source={require("../assets/images/dic.png")}
                    style={{ width: 100, height: 40, resizeMode: "contain" }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </ScreenWrapper>
  );
}
