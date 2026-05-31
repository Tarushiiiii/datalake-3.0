// export default function Index() {
//   return (
//     <ScreenWrapper>
//       <View style={globalglobalStyles.container}>
//         <Text style={globalglobalStyles.text}>Hello, World!</Text>
//       </View>
//     </ScreenWrapper>
//   );
// }

import ScreenWrapper from "@/components/ScreenWrapper";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const today = "Oct 24, 2023";
  const isMarked = false;

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C2E" />

      {/* Top sync banner */}
      <View style={globalStyles.syncBanner}>
        <MaterialCommunityIcons
          name="cloud-sync-outline"
          size={16}
          color="#fff"
        />
        <Text style={globalStyles.syncText}>Sync Status: Up to date</Text>
      </View>

      {/* Profile Header */}
      <TouchableOpacity
        style={globalStyles.profileCard}
        onPress={() => router.push("/profile")}
        activeOpacity={0.8}
      >
        <View style={globalStyles.profileLeft}>
          <Image
            source={{ uri: "https://i.pravatar.cc/80?img=11" }}
            style={globalStyles.avatar}
            contentFit="cover"
          />
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>Rahul Sharma</Text>
            <Text style={globalStyles.profileRole}>
              Field Inspector, Zone A
            </Text>
            <Text style={globalStyles.profileId}>ID: EMP-8472-MX</Text>
          </View>
        </View>
        <TouchableOpacity
          style={globalStyles.qrButton}
          accessibilityLabel="Show QR code"
        >
          <MaterialCommunityIcons name="qrcode" size={26} color="#333" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Attendance Card */}
      <View style={globalStyles.card}>
        <View style={globalStyles.cardHeader}>
          <Text style={globalStyles.cardTitle}>TODAY'S ATTENDANCE</Text>
          <Text style={globalStyles.cardDate}>{today}</Text>
        </View>

        {/* Status Block */}
        <View style={globalStyles.statusBlock}>
          {isMarked ? (
            <>
              <View
                style={[
                  globalStyles.statusIconCircle,
                  globalStyles.statusIconSuccess,
                ]}
              >
                <Ionicons name="checkmark" size={32} color="#1A6B3C" />
              </View>
              <Text
                style={[
                  globalStyles.statusLabel,
                  globalStyles.statusLabelSuccess,
                ]}
              >
                Marked
              </Text>
              <Text style={globalStyles.statusDescription}>
                Your attendance has been logged for today.
              </Text>
            </>
          ) : (
            <>
              <View
                style={[
                  globalStyles.statusIconCircle,
                  globalStyles.statusIconDanger,
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={32}
                  color="#C0392B"
                />
              </View>
              <Text
                style={[
                  globalStyles.statusLabel,
                  globalStyles.statusLabelDanger,
                ]}
              >
                Not Marked
              </Text>
              <Text style={globalStyles.statusDescription}>
                Your attendance has not been logged for today. Please check-in
                from your site.
              </Text>
            </>
          )}
        </View>

        {/* GPS Site Row */}
        <View style={globalStyles.siteRow}>
          <Ionicons
            name="navigate-outline"
            size={18}
            color="#555"
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={globalStyles.siteName}>
              Site: Sector 18 Road Expansion
            </Text>
            <Text style={globalStyles.gpsAccuracy}>
              GPS Accuracy: <Text style={globalStyles.gpsHigh}>High (4m)</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={globalStyles.ctaButton}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Mark My Attendance"
      >
        <Ionicons
          name="finger-print"
          size={22}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={globalStyles.ctaText}>Mark My Attendance</Text>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={globalStyles.statsRow}>
        <View style={globalStyles.statCard}>
          <Text style={globalStyles.statLabel}>THIS WEEK</Text>
          <Text style={globalStyles.statValue}>4 / 5</Text>
          <Text style={globalStyles.statSub}>Days Present</Text>
        </View>
        <View style={[globalStyles.statCard, globalStyles.statCardRight]}>
          <Text style={globalStyles.statLabel}>TOTAL HOURS</Text>
          <Text style={globalStyles.statValue}>32.5</Text>
          <Text style={globalStyles.statSub}>Working Hours</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}
