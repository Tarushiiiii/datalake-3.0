import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileHeader() {
  return (
    <TouchableOpacity
      style={globalStyles.profileCard}
      onPress={() => router.push("/profile")}
    >
      <View style={globalStyles.profileLeft}>
        <Image
          source={require("../assets/images/profile.png")}
          style={globalStyles.avatar}
          contentFit="cover"
        />
        <View style={globalStyles.profileInfo}>
          <Text style={globalStyles.profileName}>Riya Sharma</Text>
          <Text style={globalStyles.profileRole}>Field Inspector</Text>
          <Text style={globalStyles.profileRole}>Sector 15, Noida</Text>
          <Text style={globalStyles.profileId}>ID: EMP-8472-MX</Text>
        </View>
      </View>
      <TouchableOpacity
        style={globalStyles.qrButton}
        accessibilityLabel="Show QR code"
      >
        <MaterialCommunityIcons
          name="qrcode"
          size={26}
          color={colors.auxiliary2}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
