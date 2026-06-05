/**
 * blinkEyes.tsx
 *
 * Presentational prompt card for blink detection.
 * Backend requires 2 blinks.
 */

import { StyleSheet, Text, View } from "react-native";

interface Props {
  active?: boolean;
  blinkCount?: number;
}

const REQUIRED_BLINKS = 2;

const BlinkEyes = ({ active = false, blinkCount = 0 }: Props) => {
  const dots = Array(REQUIRED_BLINKS)
    .fill("○")
    .map((empty, i) => (i < blinkCount ? "●" : empty));

  const hint =
    blinkCount === 0
      ? "Blink twice naturally"
      : blinkCount === 1
        ? "One more blink!"
        : "✓ Blinks captured!";

  const hintColor =
    blinkCount >= REQUIRED_BLINKS
      ? "#34D399"
      : "#FBBF24";

  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <Text style={styles.icon}>◉</Text>

      <View style={styles.content}>
        <Text style={styles.title}>Blink Detection</Text>

        <Text style={styles.sub}>
          Complete {REQUIRED_BLINKS} natural blinks
        </Text>

        <View style={styles.dotsRow}>
          {dots.map((dot, i) => (
            <Text
              key={i}
              style={[
                styles.dot,
                i < blinkCount && styles.dotFilled,
              ]}
            >
              {dot}
            </Text>
          ))}
        </View>

        <Text style={styles.progressText}>
          {Math.min(blinkCount, REQUIRED_BLINKS)}/{REQUIRED_BLINKS}
        </Text>

        <Text style={[styles.hint, { color: hintColor }]}>
          {hint}
        </Text>
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

  cardActive: {
    borderColor: "#FBBF24",
  },

  icon: {
    fontSize: 28,
    color: "#FBBF24",
  },

  content: {
    flex: 1,
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  sub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginTop: 2,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },

  dot: {
    fontSize: 22,
    color: "rgba(255,255,255,0.25)",
  },

  dotFilled: {
    color: "#FBBF24",
  },

  progressText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  hint: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default BlinkEyes;