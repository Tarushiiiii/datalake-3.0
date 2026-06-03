// import React from "react";
// import { View } from "react-native";

// const BlinkEyes = () => {
//   return (
//     <View>
//       Alert.alert("Blink 2-3 times while recording. ALERT: If user carries
//       specs, required to remove it.");
//     </View>
//   );
// };

// export default BlinkEyes;

/**
 * blinkEyes.tsx
 *
 * Presentational prompt card for the blink detection step.
 */

import { StyleSheet, Text, View } from "react-native";

interface Props {
  active?: boolean;
}

const BlinkEyes = ({ active = false }: Props) => {
  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <Text style={styles.icon}>◉</Text>
      <View>
        <Text style={styles.title}>Blink Detection</Text>
        <Text style={styles.sub}>Blink 2–3 times naturally</Text>
        <Text style={styles.hint}>⚠ Remove glasses if wearing any</Text>
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
  cardActive: { borderColor: "#FBBF24" },
  icon: { fontSize: 28, color: "#FBBF24" },
  title: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  hint: { color: "#FBBF24", fontSize: 11, marginTop: 4 },
});

export default BlinkEyes;
