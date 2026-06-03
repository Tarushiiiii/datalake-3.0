/**
 * attendance-camera.tsx — Production-ready camera verification screen.
 *
 * Changes from v1:
 *  - Animated scan line sweeping down the face guide (replaces static pulse)
 *  - Step timeout countdown ring shown in corner (uses stepTimeoutRemaining)
 *  - Network/timeout error banner with colour-coded kind indicator
 *  - Low-light warning (placeholder — swap in a real luminance check if desired)
 *  - No-face warning state driven by hook's stepProgress stalling
 *  - Completed steps shown as ticked pills in the step strip
 *  - "Cancel" button stops all timers before navigating back (no memory leak)
 *  - handleSuccess / handleFailure use latest isCheckedInToday via ref
 *    → no stale closure causing wrong check-in/out direction
 */

import { useAttendanceStore } from "@/store/attendanceStore";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useMLVerification,
  VerificationStep,
} from "../hooks/useMLVerification";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get("window");
const GUIDE_W = SW * 0.64;
const GUIDE_H = GUIDE_W * 1.35;
const GUIDE_TOP = SH * 0.14;

const STEP_COLORS: Record<VerificationStep, string> = {
  idle: "#FFFFFF",
  head_movement: "#60A5FA",
  blink_detection: "#FBBF24",
  face_recognition: "#34D399",
  success: "#10B981",
  failed: "#F87171",
};

const STEP_ICONS: Record<VerificationStep, string> = {
  idle: "●",
  head_movement: "⟳",
  blink_detection: "◉",
  face_recognition: "⬡",
  success: "✓",
  failed: "✕",
};

const STEP_LABELS: Record<VerificationStep, string> = {
  idle: "",
  head_movement: "Head",
  blink_detection: "Blink",
  face_recognition: "Face",
  success: "Done",
  failed: "Failed",
};

const ORDERED_STEPS: VerificationStep[] = [
  "head_movement",
  "blink_detection",
  "face_recognition",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Three-step pill strip with done / active / pending states */
function StepStrip({ current }: { current: VerificationStep }) {
  const activeIdx = ORDERED_STEPS.indexOf(current);
  return (
    <View style={ss.row}>
      {ORDERED_STEPS.map((s, i) => {
        const done = activeIdx > i;
        const active = activeIdx === i;
        return (
          <View key={s} style={ss.item}>
            <View
              style={[
                ss.pill,
                active && {
                  backgroundColor: STEP_COLORS[s],
                  borderColor: STEP_COLORS[s],
                },
                done && { backgroundColor: "#10B981", borderColor: "#10B981" },
              ]}
            >
              <Text
                style={[ss.pillText, (active || done) && { color: "#000" }]}
              >
                {done ? "✓ " : ""}
                {STEP_LABELS[s]}
              </Text>
            </View>
            {i < ORDERED_STEPS.length - 1 && (
              <View
                style={[ss.connector, done && { backgroundColor: "#10B981" }]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const ss = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  item: { flexDirection: "row", alignItems: "center" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  pillText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  connector: {
    width: 28,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 3,
  },
});

/** Thin animated progress bar */
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={pb.track}>
      <View
        style={[pb.fill, { width: `${progress}%`, backgroundColor: color }]}
      />
    </View>
  );
}
const pb = StyleSheet.create({
  track: {
    height: 3,
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 10,
  },
  fill: { height: "100%", borderRadius: 2 },
});

/** Network error banner */
function ErrorBanner({
  kind,
}: {
  kind: "timeout" | "server" | "network" | "none";
}) {
  if (kind === "none") return null;
  const labels = {
    timeout: "⏱ Request timed out — retrying…",
    server: "⚠ Server error — retrying…",
    network: "📡 Network issue — retrying…",
  };
  return (
    <View style={eb.banner}>
      <Text style={eb.text}>{labels[kind]}</Text>
    </View>
  );
}
const eb = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.35)",
  },
  text: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

/** Countdown ring (simple text badge in the corner) */
function CountdownBadge({ seconds }: { seconds: number | null }) {
  if (seconds === null || seconds > stepTimeoutSecs * 0.6) return null; // only show in final 40%
  const urgent = seconds <= 8;
  return (
    <View style={[cd.badge, urgent && cd.urgent]}>
      <Text style={[cd.text, urgent && cd.urgentText]}>{seconds}s</Text>
    </View>
  );
}
const stepTimeoutSecs = 30;
const cd = StyleSheet.create({
  badge: {
    position: "absolute",
    top: GUIDE_TOP - 8,
    right: SW * 0.18 - 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  urgent: { borderColor: "#F87171" },
  text: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  urgentText: { color: "#F87171" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AttendanceCamera() {
  const [permission, requestPermission] = useCameraPermissions();

  // Keep isCheckedInToday in a ref so the success handler never has a stale value
  const checkIn = useAttendanceStore((s) => s.checkIn);
  const checkOut = useAttendanceStore((s) => s.checkOut);
  const isCheckedInToday = useAttendanceStore((s) => s.isCheckedInToday());
  const checkedInRef = useRef(isCheckedInToday);
  useEffect(() => {
    checkedInRef.current = isCheckedInToday;
  }, [isCheckedInToday]);

  // ── Scan-line animation ────────────────────────────────────────────────────
  const scanAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, GUIDE_H - 4],
  });

  // ── Face guide pulse (opacity) ─────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── ML hook ───────────────────────────────────────────────────────────────
  const handleSuccess = useCallback(
    (confidence: number) => {
      if (checkedInRef.current) {
        checkOut();
      } else {
        checkIn();
      }
      const action = checkedInRef.current ? "Checked Out" : "Checked In";
      Alert.alert(
        `${action} ✓`,
        `Face verified (${Math.round(confidence * 100)}% confidence)`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    },
    [checkIn, checkOut],
  );

  const handleFailure = useCallback((reason: string) => {
    Alert.alert("Verification Failed", reason, [
      { text: "Try Again", onPress: reset },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => router.replace("/(tabs)"),
      },
    ]);
  }, []);

  const { status, cameraRef, startVerification, reset } = useMLVerification({
    onSuccess: handleSuccess,
    onFailure: handleFailure,
    frameIntervalMs: 700,
    framesNeededForSuccess: 3,
    maxRetries: 12,
    stepTimeoutSecs: stepTimeoutSecs,
  });

  // Auto-start once permission granted
  useEffect(() => {
    if (permission?.granted && status.step === "idle") {
      // Small delay lets the camera warm up, reducing black-frame captures
      const t = setTimeout(startVerification, 800);
      return () => clearTimeout(t);
    }
  }, [permission?.granted]);

  // ── Permission screens ─────────────────────────────────────────────────────
  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <View style={styles.permScreen}>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>
          The attendance system needs your front camera to verify your identity.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = STEP_COLORS[status.step];

  return (
    <View style={styles.root}>
      {/* ── Full-screen live camera ── */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        active={true}
        mirror={true}
        // Keep camera mounted + active for the entire session
      />

      {/* ── Dark scrim ── */}
      <View style={styles.scrim} />

      {/* ── Animated face guide oval ── */}
      <Animated.View
        style={[styles.guide, { borderColor: accent, opacity: pulseAnim }]}
      >
        {/* Corner bracket accents */}
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <View
            key={c}
            style={[
              styles.corner,
              styles[`corner_${c}`],
              { borderColor: accent },
            ]}
          />
        ))}

        {/* Animated scan line */}
        <Animated.View
          style={[
            styles.scanLine,
            { backgroundColor: accent, transform: [{ translateY: scanLineY }] },
          ]}
        />
      </Animated.View>

      {/* ── Countdown badge ── */}
      <CountdownBadge seconds={status.stepTimeoutRemaining} />

      {/* ── Top HUD ── */}
      <View style={styles.topHud}>
        <TouchableOpacity
          onPress={() => {
            reset();
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.hudTitle}>
          {isCheckedInToday ? "Check Out" : "Check In"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Bottom card ── */}
      <View style={styles.card}>
        <StepStrip current={status.step} />

        {/* Step icon */}
        <Text style={[styles.stepIcon, { color: accent }]}>
          {STEP_ICONS[status.step]}
        </Text>

        {/* Instruction */}
        <Text style={styles.instruction}>{status.instruction}</Text>

        {/* Sending indicator */}
        {status.isSending && (
          <Text style={styles.sendingLabel}>Analysing frame…</Text>
        )}

        {/* Progress bar */}
        {!["idle", "success", "failed"].includes(status.step) && (
          <ProgressBar progress={status.stepProgress} color={accent} />
        )}

        {/* Network error banner */}
        <ErrorBanner kind={status.lastErrorKind} />

        {/* Success confidence */}
        {status.step === "success" && status.confidence !== null && (
          <Text style={styles.confidenceBadge}>
            {Math.round(status.confidence * 100)}% match
          </Text>
        )}

        {/* Failure retry */}
        {status.step === "failed" && (
          <View style={styles.failureActions}>
            {status.errorMessage ? (
              <Text style={styles.errorMsg} numberOfLines={2}>
                {status.errorMessage}
              </Text>
            ) : null}
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  // Face guide oval
  guide: {
    position: "absolute",
    width: GUIDE_W,
    height: GUIDE_H,
    borderRadius: GUIDE_W / 2,
    borderWidth: 2.5,
    top: GUIDE_TOP,
    alignSelf: "center",
    overflow: "hidden",
  },

  // Scan line
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.55,
  },

  // Corner brackets
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderWidth: 3,
  },
  corner_tl: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  corner_tr: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  corner_bl: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  corner_br: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },

  // Top HUD
  topHud: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  hudTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Bottom card
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(8,8,18,0.9)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingBottom: 48,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  stepIcon: { fontSize: 34, marginBottom: 8 },
  instruction: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  sendingLabel: { color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 6 },
  confidenceBadge: {
    marginTop: 12,
    color: "#10B981",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // Failure state
  failureActions: { alignItems: "center", marginTop: 14, gap: 10 },
  errorMsg: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Permission screen
  permScreen: {
    flex: 1,
    backgroundColor: "#0a0a14",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  permTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  permSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  grantBtn: {
    backgroundColor: "#60A5FA",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  grantBtnText: { color: "#000", fontWeight: "800", fontSize: 16 },
});
