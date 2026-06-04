/**
 * frontend/components/headMovement.tsx
 *
 * Presentational prompt card for the head-movement verification step.
 * All stage data comes from useMLVerification → backend state machine.
 *
 * Stages (mirror backend head_movement_service.py):
 *   look_straight | turn_left | center | turn_right | final_center
 */

import { StyleSheet, Text, View } from "react-native";
import { HeadMovementStage } from "../hooks/useMLVerification";

interface Props {
  stage?: HeadMovementStage;
  active?: boolean;
}

const stageMap: Record<
  NonNullable<HeadMovementStage>,
  { icon: string; title: string; sub: string; color: string }
> = {
  look_straight: {
    icon: "◉",
    title: "Look Straight",
    sub: "Keep your face centered in the frame",
    color: "#9CA3AF",
  },
  turn_left: {
    icon: "←",
    title: "Turn Left",
    sub: "Slowly rotate your head to the left",
    color: "#F59E0B",
  },
  center: {
    icon: "◎",
    title: "Center Face",
    sub: "Return your face to center",
    color: "#14B8A6",
  },
  turn_right: {
    icon: "→",
    title: "Turn Right",
    sub: "Slowly rotate your head to the right",
    color: "#3B82F6",
  },
  final_center: {
    icon: "◉",
    title: "Look Straight",
    sub: "Hold still for liveness check",
    color: "#A78BFA",
  },
};

const HeadMovement = ({ stage = "look_straight", active = false }: Props) => {
  const key = stage ?? "look_straight";
  const data = stageMap[key];

  return (
    <View style={[styles.card, active && { borderColor: data.color }]}>
      <Text style={[styles.icon, { color: data.color }]}>{data.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.sub}>{data.sub}</Text>
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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  icon: { fontSize: 30, fontWeight: "700" },
  title: { color: "#fff", fontWeight: "700", fontSize: 16 },
  sub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});

export default HeadMovement;
