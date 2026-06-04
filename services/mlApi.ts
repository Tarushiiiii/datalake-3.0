/**
 * frontend/services/mlApi.ts
 *
 * Production-ready service layer for the AI attendance backend.
 *
 * Key points:
 *  - HeadMovementResult now carries `stage` — the backend drives the UI stage
 *    sequence, not a local frame counter.
 *  - Session ID injected into every request.
 *  - Exponential-backoff retry on network errors.
 *  - Adaptive JPEG quality based on rolling latency average.
 *  - Request deduplication: ignores in-flight duplicate calls per step.
 *  - Centralised error categorisation (timeout / server / network).
 */

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Replace with your FastAPI server URL:
 *   LAN dev  → "http://192.168.x.x:8000"
 *   Railway  → "https://your-app.railway.app"
 *   ngrok    → "https://xxxx.ngrok.io"
 */
export const BASE_URL = process.env.BASE_URL || "http://192.168.29.102:8000";

/** Initial request timeout (ms). Adaptive logic may lower this at runtime. */
const REQUEST_TIMEOUT_MS = 8_000;

/** Max retries per frame send (with exponential backoff). */
const MAX_SEND_RETRIES = 2;

/** Base delay (ms) for exponential backoff: 200 → 400 → 800 */
const BACKOFF_BASE_MS = 200;

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * HEAD MOVEMENT
 * The backend is a state machine that drives the stage sequence.
 * It returns the *next* stage the client should display.
 *
 * Backend stage values (from head_movement_service.py):
 *   "look_straight" | "turn_left" | "center" | "turn_right" | "final_center" | "verified"
 *
 * success === true only when stage === "verified" and liveness passes.
 */
export interface HeadMovementResult {
  success: boolean;
  /** The stage the backend has advanced to — use this to update the UI. */
  stage?:
    | "look_straight"
    | "turn_left"
    | "center"
    | "turn_right"
    | "final_center"
    | "verified";
  message?: string;
  confidence?: number;
}

export interface BlinkDetectionResult {
  success: boolean;
  blink_count?: number;
  message?: string;
}

export interface FaceRecognitionResult {
  matched: boolean;
  confidence: number;
  user_id?: string;
  message?: string;
}

export type MLStep = "head_movement" | "blink_detection" | "face_recognition";

export interface FramePayload {
  /** Base64-encoded JPEG — no "data:image/jpeg;base64," prefix */
  frame: string;
  /** ISO timestamp of capture */
  timestamp: string;
  /** UUID for this verification session */
  session_id: string;
  /** Current step name — useful for backend logging */
  step: MLStep;
}

export type MLErrorKind = "timeout" | "server" | "network" | "none";

export interface MLResult<T> {
  data: T | null;
  errorKind: MLErrorKind;
  latencyMs: number;
}

// ─── Adaptive quality ─────────────────────────────────────────────────────────

class AdaptiveQuality {
  private samples: number[] = [];
  private readonly maxSamples = 6;

  record(latencyMs: number) {
    this.samples.push(latencyMs);
    if (this.samples.length > this.maxSamples) this.samples.shift();
  }

  get quality(): number {
    if (this.samples.length < 2) return 0.35;
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    if (avg < 600) return 0.45;
    if (avg < 1200) return 0.35;
    if (avg < 2000) return 0.28;
    return 0.2;
  }

  reset() {
    this.samples = [];
  }
}

export const adaptiveQuality = new AdaptiveQuality();

// ─── In-flight deduplication ──────────────────────────────────────────────────

const inFlight = new Set<MLStep>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function stripDataUrlPrefix(base64: string): string {
  const idx = base64.indexOf(",");
  return idx !== -1 ? base64.slice(idx + 1) : base64;
}

async function postFrame<T>(
  endpoint: string,
  payload: FramePayload,
  step: MLStep,
): Promise<MLResult<T>> {
  if (inFlight.has(step)) {
    return { data: null, errorKind: "none", latencyMs: 0 };
  }

  inFlight.add(step);
  const t0 = Date.now();
  let attempt = 0;

  while (attempt <= MAX_SEND_RETRIES) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timerId);
      const latencyMs = Date.now() - t0;
      adaptiveQuality.record(latencyMs);
      inFlight.delete(step);

      if (!res.ok) {
        console.warn(`[mlApi] ${endpoint} → HTTP ${res.status}`);
        return { data: null, errorKind: "server", latencyMs };
      }

      const data = (await res.json()) as T;
      return { data, errorKind: "none", latencyMs };
    } catch (err: any) {
      clearTimeout(timerId);

      if (err?.name === "AbortError") {
        console.warn(`[mlApi] ${endpoint} timed out (attempt ${attempt + 1})`);
        inFlight.delete(step);
        return { data: null, errorKind: "timeout", latencyMs: Date.now() - t0 };
      }

      attempt += 1;
      if (attempt > MAX_SEND_RETRIES) {
        console.warn(
          `[mlApi] ${endpoint} network error after ${attempt} attempts`,
        );
        inFlight.delete(step);
        return { data: null, errorKind: "network", latencyMs: Date.now() - t0 };
      }

      await sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1));
    }
  }

  inFlight.delete(step);
  return { data: null, errorKind: "network", latencyMs: Date.now() - t0 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * STEP 1 — Head Movement
 * POST /head-movement
 * Response: { success, stage, message, confidence? }
 *
 * The backend is a state machine per session_id. It advances through:
 * look_straight → turn_left → center → turn_right → final_center → verified
 * success === true only at the "verified" transition.
 */
export async function sendHeadMovementFrame(
  base64Frame: string,
  sessionId: string,
): Promise<MLResult<HeadMovementResult>> {
  return postFrame<HeadMovementResult>(
    "/head-movement",
    {
      frame: stripDataUrlPrefix(base64Frame),
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      step: "head_movement",
    },
    "head_movement",
  );
}

/**
 * STEP 2 — Blink Detection
 * POST /blink-detection
 * Response: { success, blink_count?, message? }
 */
export async function sendBlinkDetectionFrame(
  base64Frame: string,
  sessionId: string,
): Promise<MLResult<BlinkDetectionResult>> {
  return postFrame<BlinkDetectionResult>(
    "/blink-detection",
    {
      frame: stripDataUrlPrefix(base64Frame),
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      step: "blink_detection",
    },
    "blink_detection",
  );
}

/**
 * STEP 3 — Face Recognition
 * POST /face-recognition
 * Response: { matched, confidence, user_id?, message? }
 */
export async function sendFaceRecognitionFrame(
  base64Frame: string,
  sessionId: string,
): Promise<MLResult<FaceRecognitionResult>> {
  return postFrame<FaceRecognitionResult>(
    "/face-recognition",
    {
      frame: stripDataUrlPrefix(base64Frame),
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      step: "face_recognition",
    },
    "face_recognition",
  );
}
