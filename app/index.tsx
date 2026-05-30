import { globalStyles } from "@/styles/globalStyles";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/styles/colors";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../assets/images/main.jpg")}
        resizeMode="cover"
        style={globalStyles.backgroundImage}
      >
        {/* OVERLAY */}
        <View style={globalStyles.overlay}>
          {/* HEADER */}
          <View style={globalStyles.header}>
            <Image
              source={require("../assets/images/logo.png")}
              style={globalStyles.logo}
            />

            <TouchableOpacity>
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

            <Text style={globalStyles.label}>Registered Mobile Number *</Text>

            <TextInput
              placeholder="+91"
              placeholderTextColor={colors.shadow}
              keyboardType="phone-pad"
              style={globalStyles.input}
            />

            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Login using OTP</Text>
            </TouchableOpacity>

            <Text style={globalStyles.helpText}>
              Having trouble logging in?{" "}
              <Text style={globalStyles.helpLink}>Get Help</Text>
            </Text>

            {/* FOOTER */}
            <View style={globalStyles.footer}>
              <Text style={globalStyles.footerText}>
                powered by Digital India
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
}
