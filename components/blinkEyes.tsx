/**
 * blinkEyes.tsx
 *
 * Presentational prompt card for the blink detection step.
 * Receives `blinkCount` to show responsive progress as the user blinks.
 */

import { StyleSheet, Text, View } from "react-native";

interface Props {
  active?: boolean;
  /** Number of blinks successfully detected so far (0–3) */
  blinkCount?: number;
}

const BlinkEyes = ({ active = false, blinkCount = 0 }: Props) => {
  const dots = ["○", "○", "○"].map((empty, i) =>
    i < blinkCount ? "●" : empty,
  );

  const hint =
    blinkCount === 0
      ? "⚠ Remove glasses if wearing any"
      : blinkCount === 1
        ? "Good! Keep blinking…"
        : blinkCount === 2
          ? "One more blink!"
          : "✓ Blinks captured!";

  const hintColor =
    blinkCount === 0
      ? "#FBBF24"
      : blinkCount >= 3
        ? "#34D399"
        : "rgba(255,255,255,0.6)";

  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <Text style={styles.icon}>◉</Text>
      <View style={styles.content}>
        <Text style={styles.title}>Blink Detection</Text>
        <Text style={styles.sub}>Blink 2–3 times naturally</Text>

        {/* Responsive dot progress */}
        <View style={styles.dotsRow}>
          {dots.map((dot, i) => (
            <Text
              key={i}
              style={[styles.dot, i < blinkCount && styles.dotFilled]}
            >
              {dot}
            </Text>
          ))}
        </View>

        <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>
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
  content: { flex: 1 },
  title: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    fontSize: 18,
    color: "rgba(255,255,255,0.25)",
  },
  dotFilled: {
    color: "#FBBF24",
  },
  hint: { fontSize: 11, marginTop: 2 },
});

export default BlinkEyes;
