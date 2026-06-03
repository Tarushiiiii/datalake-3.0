// import { useAttendanceStore } from "@/store/attendanceStore";
// import { globalStyles } from "@/styles/globalStyles";
// import { router } from "expo-router";
// import React, { useState } from "react";
// import { Alert, Text, TouchableOpacity } from "react-native";

// const HeadMovement = () => {
//   const [loading, setLoading] = useState(false);
//   const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());

//   const handleMark = async () => {
//     try {
//       setLoading(true);
//       router.push({ pathname: "/attendance-camera" });
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <TouchableOpacity
//       style={globalStyles.button}
//       onPress={handleMark}
//       disabled={loading}
//     >
//       <Text style={globalStyles.buttonText}>
//         {loading ? "Please wait..." : "Check In"}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// export default HeadMovement;

/**
 * headMovement.tsx
 *
 * Thin presentational component — shows a contextual prompt card
 * for the head movement step. Actual ML logic lives in useMLVerification.
 */

import { StyleSheet, Text, View } from "react-native";

interface Props {
  active?: boolean;
}

const HeadMovement = ({ active = false }: Props) => {
  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <Text style={styles.icon}>⟳</Text>
      <View>
        <Text style={styles.title}>Head Movement</Text>
        <Text style={styles.sub}>Slowly turn your head left, then right</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardActive: { borderColor: "#60A5FA" },
  icon: { fontSize: 28, color: "#60A5FA" },
  title: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
});

export default HeadMovement;
