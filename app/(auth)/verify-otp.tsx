import { globalStyles } from "@/styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function VerifyOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    if (otp.join("") !== "5775") {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
      return;
    }

    try {
      setLoading(true);

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await AsyncStorage.setItem("isLoggedIn", "true");

      Alert.alert("Success", "OTP verified successfully.");

      // [AUTH FLOW] Use replace() so OTP screen is removed from the stack.
      // The user cannot press back from tabs to return to OTP screen.
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.cardTitle}>Enter OTP</Text>

      <View style={globalStyles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => {
              handleChange(text, index);
            }}
            keyboardType="number-pad"
            maxLength={1}
            style={globalStyles.otpInput}
          />
        ))}
      </View>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={verifyOTP}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      <View style={globalStyles.footer}>
        <Text>Didn't receive the OTP? </Text>

        <TouchableOpacity onPress={() => console.log("Resend OTP to", phone)}>
          <Text style={globalStyles.helpLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
