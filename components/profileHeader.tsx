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
          source={{ uri: "https://i.pravatar.cc/80?img=11" }}
          style={globalStyles.avatar}
          contentFit="cover"
        />
        <View style={globalStyles.profileInfo}>
          <Text style={globalStyles.profileName}>Rahul Sharma</Text>
          <Text style={globalStyles.profileRole}>Field Inspector, Zone A</Text>
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
