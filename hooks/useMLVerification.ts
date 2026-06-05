/**
 * frontend/hooks/useMLVerification.ts
 *
 * Core verification orchestrator.
 *
 * Head movement stage is driven entirely by the backend response field `stage`
 * (from head_movement_service.py). The backend is the single source of truth.
 *
 * Stage flow (backend drives):
 *   look_straight → turn_left → center → turn_right → final_center → verified
 *
 * success === true only when the backend returns stage === "verified".
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import {
  adaptiveQuality,
  sendBlinkDetectionFrame,
  sendFaceRecognitionFrame,
  sendHeadMovementFrame,
} from "../services/mlApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerificationStep =
  | "idle"
  | "head_movement"
  | "blink_detection"
  | "face_recognition"
  | "success"
  | "failed";

export type HeadMovementStage =
  | "look_straight"
  | "turn_left"
  | "center"
  | "turn_right"
  | "final_center"
  | null;

export interface VerificationStatus {
  step: VerificationStep;
  instruction: string;
  stepProgress: number;
  isSending: boolean;
  confidence: number | null;
  errorMessage: string | null;
  lastErrorKind: "timeout" | "server" | "network" | "none";
  stepTimeoutRemaining: number | null;
  headMovementStage: HeadMovementStage;
  blinkCount: number;
}

interface UseMLVerificationOptions {
  onSuccess: (confidence: number) => void;
  onFailure: (reason: string) => void;
  frameIntervalMs?: number;
  maxRetries?: number;
  stepTimeoutSecs?: number;
}

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_INSTRUCTIONS: Record<string, string> = {
  look_straight: "Look straight at the camera",
  turn_left: "Turn your head LEFT",
  center: "Return to center",
  turn_right: "Turn your head RIGHT",
  final_center: "Hold still — look straight",
  verified: "Identity verified ✓",
};

/**
 * Maps the backend `stage` string to the HeadMovementStage union.
 * "verified" is treated as "final_center" in the UI (step already done).
 */
function toUiStage(backendStage?: string): HeadMovementStage {
  if (!backendStage) return null;
  if (backendStage === "verified") return "final_center";
  return backendStage as HeadMovementStage;
}

const STAGE_ORDER = [
  "look_straight",
  "turn_left",
  "center",
  "turn_right",
  "final_center",
  "verified",
] as const;

function headMovementProgress(stage: string): number {
  const idx = STAGE_ORDER.indexOf(stage as any);
  if (idx <= 0) return 0;
  return Math.round((idx / (STAGE_ORDER.length - 1)) * 100);
}

// ─── UUID ─────────────────────────────────────────────────────────────────────

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMLVerification({
  onSuccess,
  onFailure,
  frameIntervalMs = 700,
  maxRetries = 12,
  stepTimeoutSecs = 30,
}: UseMLVerificationOptions) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<VerificationStatus>({
    step: "idle",
    instruction: "Ready",
    stepProgress: 0,
    isSending: false,
    confidence: null,
    errorMessage: null,
    lastErrorKind: "none",
    stepTimeoutRemaining: null,
    headMovementStage: null,
    blinkCount: 0,
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const cameraRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const stepRef = useRef<VerificationStep>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successCountRef = useRef(0);
  const retryCountRef = useRef(0);
  const isPausedRef = useRef(false);
  const isCapturingRef = useRef(false);
  const sessionIdRef = useRef(generateUUID());

  const onSuccessRef = useRef(onSuccess);
  const onFailureRef = useRef(onFailure);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onFailureRef.current = onFailure;
  }, [onFailure]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      isPausedRef.current = next !== "active";
    });
    return () => sub.remove();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const safeSetStatus = useCallback((patch: Partial<VerificationStatus>) => {
    if (!mountedRef.current) return;
    setStatus((prev) => ({ ...prev, ...patch }));
  }, []);

  function clearAllTimers() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (stepCountdownRef.current) {
      clearInterval(stepCountdownRef.current);
      stepCountdownRef.current = null;
    }
  }

  // ── Capture Frame ──────────────────────────────────────────────────────────
  const captureFrame = useCallback(async () => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: Math.min(adaptiveQuality.quality, 0.42),
        skipProcessing: true,
        exif: false,
        imageType: "jpg",
      });
      return photo?.base64 ?? null;
    } catch {
      return null;
    }
  }, []);

  // ── Step Timeout ───────────────────────────────────────────────────────────
  function startStepTimeout(label: string) {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    if (stepCountdownRef.current) clearInterval(stepCountdownRef.current);

    let remaining = stepTimeoutSecs;
    safeSetStatus({ stepTimeoutRemaining: remaining });

    stepCountdownRef.current = setInterval(() => {
      remaining -= 1;
      safeSetStatus({ stepTimeoutRemaining: remaining });
    }, 1000);

    stepTimeoutRef.current = setTimeout(() => {
      clearAllTimers();
      stepRef.current = "failed";
      const msg = `Step timed out: ${label}`;
      safeSetStatus({
        step: "failed",
        errorMessage: msg,
        isSending: false,
        stepTimeoutRemaining: null,
      });
      onFailureRef.current(msg);
    }, stepTimeoutSecs * 1000);
  }

  // ── Generic Step Runner ────────────────────────────────────────────────────
  const runStep = useCallback(
    <T extends { success?: boolean; matched?: boolean; confidence?: number }>(
      step: VerificationStep,
      instruction: string,
      sender: (
        frame: string,
        sessionId: string,
      ) => Promise<{ data: T | null; errorKind: string; latencyMs: number }>,
      isSuccess: (result: T) => boolean,
      onStepSuccess: (result: T) => void,
    ) => {
      clearAllTimers();
      stepRef.current = step;
      successCountRef.current = 0;
      retryCountRef.current = 0;

      safeSetStatus({
        step,
        instruction,
        stepProgress: 0,
        errorMessage: null,
        lastErrorKind: "none",
        isSending: false,
      });

      startStepTimeout(instruction);

      intervalRef.current = setInterval(async () => {
        if (!mountedRef.current) return;
        if (isPausedRef.current) return;
        if (stepRef.current !== step) return;
        if (isCapturingRef.current) return;

        isCapturingRef.current = true;
        safeSetStatus({ isSending: true });

        const frame = await captureFrame();
        if (!frame) {
          isCapturingRef.current = false;
          safeSetStatus({ isSending: false });
          return;
        }

        const { data, errorKind } = await sender(frame, sessionIdRef.current);
        isCapturingRef.current = false;

        if (!mountedRef.current) return;
        if (stepRef.current !== step) return;

        safeSetStatus({ isSending: false, lastErrorKind: errorKind as any });

        if (data && isSuccess(data)) {
          // Step fully complete
          successCountRef.current += 1;
          retryCountRef.current = 0;
          onStepSuccess(data);
        } else if (
          !data ||
          errorKind === "timeout" ||
          errorKind === "server" ||
          errorKind === "network"
        ) {
          // Real error — no response or HTTP failure. Count toward retry limit.
          retryCountRef.current += 1;
          if (retryCountRef.current >= maxRetries) {
            clearAllTimers();
            stepRef.current = "failed";
            const msg = `Verification failed at: ${instruction}`;
            safeSetStatus({
              step: "failed",
              errorMessage: msg,
              isSending: false,
            });
            onFailureRef.current(msg);
          }
        }
        // else: data returned but isSuccess===false → valid in-progress response
        // (e.g. head movement intermediate stage). Reset retries and keep polling.
        else {
          retryCountRef.current = 0;
        }
      }, frameIntervalMs);
    },
    [captureFrame, frameIntervalMs, maxRetries, safeSetStatus],
  );

  // ── Step Chain ─────────────────────────────────────────────────────────────

  const startFaceRecognition = useCallback(() => {
    runStep(
      "face_recognition",
      "Hold still — verifying your face",
      sendFaceRecognitionFrame,
      (r) => !!r.matched,
      (r) => {
        const confidence = r.confidence ?? 1;
        clearAllTimers();
        stepRef.current = "success";
        safeSetStatus({ step: "success", confidence, stepProgress: 100 });
        onSuccessRef.current(confidence);
      },
    );
  }, [runStep, safeSetStatus]);

  const startBlinkDetection = useCallback(() => {
    let blinksSoFar = 0;

    let prevBlink = false;

    let lastBlinkTime = 0;

    safeSetStatus({
      blinkCount: 0,
      instruction: "Blink 2–3 times naturally",
    });

    runStep(
      "blink_detection",

      "Blink 2–3 times naturally",

      sendBlinkDetectionFrame,

      (r) => {
        const now = Date.now();

        const isBlink = !!r.success;

        // count ONLY on false -> true transition
        // and apply cooldown
        if (isBlink && !prevBlink && now - lastBlinkTime > 150) {
          lastBlinkTime = now;

          blinksSoFar += 1;

          safeSetStatus({
            blinkCount: blinksSoFar,
          });

          if (blinksSoFar === 1) {
            safeSetStatus({
              instruction: "Good! Keep blinking…",
            });
          } else if (blinksSoFar === 2) {
            safeSetStatus({
              instruction: "One more blink!",
            });
          } else if (blinksSoFar >= 3) {
            safeSetStatus({
              instruction: "Blinks captured!",
              stepProgress: 100,
            });

            return true;
          }
        }

        prevBlink = isBlink;

        return false;
      },

      () => {
        // small delay so UI shows full dots
        setTimeout(() => {
          startFaceRecognition();
        }, 700);
      },
    );
  }, [runStep, startFaceRecognition, safeSetStatus]);

  // ── Head Movement ──────────────────────────────────────────────────────────
  // Backend (head_movement_service.py) is a per-session state machine.
  // Each frame response: { success, stage, message?, confidence? }
  // success === true → stage === "verified" → advance to blink detection
  // success === false → stage = next expected stage → update UI, keep polling
  const startHeadMovement = useCallback(() => {
    safeSetStatus({
      headMovementStage: "look_straight",
      instruction: STAGE_INSTRUCTIONS.look_straight,
      stepProgress: 0,
    });

    runStep(
      "head_movement",
      STAGE_INSTRUCTIONS.look_straight,
      sendHeadMovementFrame,
      (r) => {
        // Sync UI stage from every backend response (success or not)
        if (r.stage) {
          safeSetStatus({
            headMovementStage: toUiStage(r.stage),
            instruction: STAGE_INSTRUCTIONS[r.stage] ?? r.message ?? "",
            stepProgress: headMovementProgress(r.stage),
          });
        }
        return !!r.success;
      },
      () => {
        setTimeout(() => startBlinkDetection(), 500);
      },
    );
  }, [runStep, startBlinkDetection, safeSetStatus]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const startVerification = useCallback(() => {
    clearAllTimers();
    adaptiveQuality.reset();
    sessionIdRef.current = generateUUID();
    startHeadMovement();
  }, [startHeadMovement]);

  const reset = useCallback(() => {
    clearAllTimers();
    adaptiveQuality.reset();
    sessionIdRef.current = generateUUID();
    successCountRef.current = 0;
    retryCountRef.current = 0;
    stepRef.current = "idle";
    safeSetStatus({
      step: "idle",
      instruction: "Ready",
      stepProgress: 0,
      isSending: false,
      confidence: null,
      errorMessage: null,
      lastErrorKind: "none",
      stepTimeoutRemaining: null,
      headMovementStage: null,
      blinkCount: 0,
    });
  }, [safeSetStatus]);

  return {
    status,
    cameraRef,
    startVerification,
    reset,
    sessionId: sessionIdRef.current,
  };
}
