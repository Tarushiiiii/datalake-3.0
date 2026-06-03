// import React from "react";
// import { Text, View } from "react-native";

// const FaceRecognition = () => {
//   return (
//     <View>
//       <Text>FaceRecognition</Text>
//     </View>
//   );
// };

// export default FaceRecognition;

/**
 * faceRecognition.tsx
 *
 * Presentational prompt card for the face recognition step.
 */

import { StyleSheet, Text, View } from "react-native";

interface Props {
  active?: boolean;
  confidence?: number | null;
}

const FaceRecognition = ({ active = false, confidence }: Props) => {
  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <Text style={styles.icon}>⬡</Text>
      <View>
        <Text style={styles.title}>Face Recognition</Text>
        <Text style={styles.sub}>Hold still — comparing face embedding</Text>
        {confidence !== null && confidence !== undefined && (
          <Text style={styles.confidence}>
            {Math.round(confidence * 100)}% match
          </Text>
        )}
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
  cardActive: { borderColor: "#34D399" },
  icon: { fontSize: 28, color: "#34D399" },
  title: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  confidence: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
});

export default FaceRecognition;
