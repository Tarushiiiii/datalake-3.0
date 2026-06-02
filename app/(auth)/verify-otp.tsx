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
      Alert.alert(
        "Invalid Security Code",
        "Please enter the correct Security Code.",
      );
      return;
    }

    try {
      setLoading(true);

      // Simulated API delay — replace with real Security Code verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await AsyncStorage.setItem("isLoggedIn", "true");

      Alert.alert("Success", "Security Code verified successfully.");

      // [AUTH FLOW] Use replace() so Security Code screen is removed from the stack.
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={globalStyles.container}>
        <View style={globalStyles.card}>
          {/* Card Header */}
          <View style={globalStyles.cardHeader}>
            <Text style={globalStyles.cardTitle}>Enter Security Code</Text>
          </View>

          {/* Security Code Inputs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 24,
            }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
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
              {loading ? "Verifying..." : "Verify Security Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
