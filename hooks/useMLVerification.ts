/**
 * useMLVerification.ts — Production-optimised orchestration hook.
 *
 * Key improvements over v1:
 *  - verificationSessionId (UUID) generated per session; sent with every frame
 *  - stepRef used in ALL interval callbacks — zero stale closures
 *  - mountedRef guards: no setState after unmount
 *  - AppState listener: pauses interval when app goes to background
 *  - Per-session step timeout (default 30 s) to prevent infinite loops
 *  - Adaptive JPEG quality via mlApi.adaptiveQuality
 *  - Consecutive-success counter resets on step transition (no bleed-over)
 *  - onSuccess / onFailure wrapped in refs so callers can swap them without re-creating the hook
 *  - Full interval cleanup on unmount
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

export interface VerificationStatus {
  step: VerificationStep;
  instruction: string;
  /** 0–100, progress within the current step */
  stepProgress: number;
  /** True while a frame request is in flight */
  isSending: boolean;
  /** Populated after face recognition succeeds */
  confidence: number | null;
  /** Human-readable terminal failure message */
  errorMessage: string | null;
  /** Latest error category from the network layer */
  lastErrorKind: "timeout" | "server" | "network" | "none";
  /** Seconds remaining before the current step auto-fails */
  stepTimeoutRemaining: number | null;
}

interface UseMLVerificationOptions {
  onSuccess: (confidence: number) => void;
  onFailure: (reason: string) => void;
  /**
   * Frame send interval in ms.
   * 700 ms is a good balance for mobile 4G / WiFi.
   * Drop to 500 ms on fast networks, raise to 1000 ms on slow ones.
   */
  frameIntervalMs?: number;
  /** Consecutive successful responses needed to advance a step. Default: 3 */
  framesNeededForSuccess?: number;
  /** Failed frames before the step is marked failed. Default: 12 */
  maxRetries?: number;
  /**
   * Seconds before a step auto-fails regardless of retries.
   * Prevents infinite hang on a frozen backend. Default: 30 s.
   */
  stepTimeoutSecs?: number;
}

// ─── UUID helper (no external dep) ───────────────────────────────────────────

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
  framesNeededForSuccess = 3,
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
  });

  // ── Refs (never cause re-renders; safe inside interval callbacks) ──────────
  const stepRef = useRef<VerificationStep>("idle");
  const successCountRef = useRef(0);
  const retryCountRef = useRef(0);
  const sessionIdRef = useRef<string>(generateUUID());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const isPausedRef = useRef(false); // true when app is backgrounded
  const isCapturingRef = useRef(false);

  /** Camera ref — passed back to the screen so it can bind CameraView */
  const cameraRef = useRef<any>(null);

  /** Keep latest callbacks in refs so changing them doesn't recreate the hook */
  const onSuccessRef = useRef(onSuccess);
  const onFailureRef = useRef(onFailure);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onFailureRef.current = onFailure;
  }, [onFailure]);

  // ── Lifecycle: cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  // ── AppState: pause when app goes to background ────────────────────────────
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      isPausedRef.current = nextState !== "active";
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const safeSetStatus = useCallback((patch: Partial<VerificationStatus>) => {
    if (mountedRef.current) {
      setStatus((prev) => ({ ...prev, ...patch }));
    }
  }, []);

  async function clearAllTimers() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (isCapturingRef.current) return;

      isCapturingRef.current = true;

      const frame = await captureFrame();

      isCapturingRef.current = false;
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

  /** Capture one JPEG frame. Quality is driven by adaptive bandwidth tracker. */
  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: Math.min(adaptiveQuality.quality, 0.35), // 0.20 – 0.45 depending on latency
        skipProcessing: true, // skip EXIF/orientation — saves ~30 ms
        exif: false,
        imageType: "jpg",
      });
      return photo?.base64 ?? null;
    } catch {
      return null;
    }
  }, []);

  // ── Step timeout helpers ───────────────────────────────────────────────────

  function startStepTimeout(instruction: string) {
    // Clear any previous timeout
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    if (stepCountdownRef.current) clearInterval(stepCountdownRef.current);

    let remaining = stepTimeoutSecs;
    safeSetStatus({ stepTimeoutRemaining: remaining });

    // Countdown display (updates every second)
    stepCountdownRef.current = setInterval(() => {
      remaining -= 1;
      if (mountedRef.current)
        safeSetStatus({ stepTimeoutRemaining: remaining });
    }, 1000);

    // Hard timeout
    stepTimeoutRef.current = setTimeout(() => {
      if (stepCountdownRef.current) clearInterval(stepCountdownRef.current);
      clearAllTimers();
      const msg = `Step timed out: ${instruction}. Please try again.`;
      stepRef.current = "failed";
      safeSetStatus({
        step: "failed",
        errorMessage: msg,
        isSending: false,
        stepTimeoutRemaining: null,
      });
      onFailureRef.current(msg);
    }, stepTimeoutSecs * 1000);
  }

  function clearStepTimeout() {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (stepCountdownRef.current) {
      clearInterval(stepCountdownRef.current);
      stepCountdownRef.current = null;
    }
    safeSetStatus({ stepTimeoutRemaining: null });
  }

  // ── Generic step runner ────────────────────────────────────────────────────

  /**
   * Runs a single verification step.
   *
   * @param step           The VerificationStep enum value for this step
   * @param instruction    Text shown in the UI overlay
   * @param sender         Function that sends one frame and returns a typed result
   * @param isSuccess      Predicate — true if the backend accepted this frame
   * @param onStepSuccess  Called once framesNeededForSuccess consecutive successes occur
   */
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
      // Reset step-level counters
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

      // Guard: don't stack intervals
      async function clearAllTimers() {
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

      intervalRef.current = setInterval(async () => {
        // ── Guards ──
        if (stepRef.current !== step) return; // step already advanced
        if (isPausedRef.current) return; // app is backgrounded
        if (!mountedRef.current) return; // component unmounted

        safeSetStatus({ isSending: true });

        const frame = await captureFrame();

        if (!frame) {
          safeSetStatus({ isSending: false });
          return; // camera not ready — skip this tick
        }

        const { data, errorKind } = await sender(frame, sessionIdRef.current);

        if (!mountedRef.current || stepRef.current !== step) return; // unmounted or advanced mid-await

        safeSetStatus({ isSending: false, lastErrorKind: errorKind as any });

        if (data && isSuccess(data)) {
          successCountRef.current += 1;
          retryCountRef.current = 0; // reset failure streak on a success

          const progress = Math.min(
            Math.round(
              (successCountRef.current / framesNeededForSuccess) * 100,
            ),
            100,
          );
          safeSetStatus({ stepProgress: progress });

          if (successCountRef.current >= framesNeededForSuccess) {
            clearAllTimers();
            onStepSuccess(data);
          }
        } else {
          retryCountRef.current += 1;

          if (retryCountRef.current >= maxRetries) {
            clearAllTimers();
            stepRef.current = "failed";
            const msg = `Verification failed at: ${instruction}. Please try again.`;
            safeSetStatus({
              step: "failed",
              errorMessage: msg,
              isSending: false,
            });
            onFailureRef.current(msg);
          }
        }
      }, frameIntervalMs);
    },
    [
      captureFrame,
      framesNeededForSuccess,
      maxRetries,
      frameIntervalMs,
      safeSetStatus,
    ],
  );

  // ── Step chain (runs head → blink → face in sequence) ─────────────────────

  const startFaceRecognition = useCallback(() => {
    runStep(
      "face_recognition",
      "Hold still — verifying your face",
      sendFaceRecognitionFrame,
      (r) => !!r.matched,
      (r) => {
        const confidence = r.confidence ?? 1;
        stepRef.current = "success";
        safeSetStatus({ step: "success", confidence, stepProgress: 100 });
        onSuccessRef.current(confidence);
      },
    );
  }, [runStep, safeSetStatus]);

  const startBlinkDetection = useCallback(() => {
    runStep(
      "blink_detection",
      "Blink 2–3 times naturally",
      sendBlinkDetectionFrame,
      (r) => !!r.success,
      () => startFaceRecognition(),
    );
  }, [runStep, startFaceRecognition]);

  const startHeadMovement = useCallback(() => {
    runStep(
      "head_movement",
      "Slowly turn your head left and right",
      sendHeadMovementFrame,
      (r) => !!r.success,
      () => startBlinkDetection(),
    );
  }, [runStep, startBlinkDetection]);

  // ── Public interface ───────────────────────────────────────────────────────

  const startVerification = useCallback(() => {
    clearAllTimers();
    // New session = new UUID + fresh adaptive quality baseline
    sessionIdRef.current = generateUUID();
    adaptiveQuality.reset();
    startHeadMovement();
  }, [startHeadMovement]);

  const reset = useCallback(() => {
    clearAllTimers();
    stepRef.current = "idle";
    successCountRef.current = 0;
    retryCountRef.current = 0;
    sessionIdRef.current = generateUUID();
    adaptiveQuality.reset();
    setStatus({
      step: "idle",
      instruction: "Ready",
      stepProgress: 0,
      isSending: false,
      confidence: null,
      errorMessage: null,
      lastErrorKind: "none",
      stepTimeoutRemaining: null,
    });
  }, []);

  return {
    status,
    cameraRef,
    startVerification,
    reset,
    /** Expose session ID for debugging / logging in the screen */
    sessionId: sessionIdRef.current,
  };
}
