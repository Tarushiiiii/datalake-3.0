/**
 * mlApi.ts — Production-ready service layer for AI attendance backend.
 *
 * Changes from v1:
 *  - Session ID injected into every request
 *  - Exponential backoff retry (network blips → auto-recover)
 *  - Adaptive quality: reduces JPEG quality if requests are consistently slow
 *  - Request deduplication: ignores in-flight duplicate calls per step
 *  - Centralised error categorisation (timeout / server / network)
 *  - All backend URLs in one place; swap BASE_URL for production deploy
 */

// ─── Config ──────────────────────────────────────────────────────────────────

/**
 * Replace with your FastAPI server URL:
 *   LAN dev  → "http://192.168.x.x:8000"
 *   Railway  → "https://your-app.railway.app"
 *   ngrok    → "https://xxxx.ngrok.io"
 */
export const BASE_URL = "http://192.168.29.102:8000";

/** Initial request timeout. Adaptive logic may lower this at runtime. */
const REQUEST_TIMEOUT_MS = 8_000;

/** Max retries per frame send (with exponential backoff). */
const MAX_SEND_RETRIES = 2;

/** Base delay (ms) for exponential backoff: 200 → 400 → 800 */
const BACKOFF_BASE_MS = 200;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeadMovementResult {
  success: boolean;
  message?: string;
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
  /** UUID for this verification session — lets the backend correlate frames */
  session_id: string;
  /** Current step name — useful for backend logging / debugging */
  step: MLStep;
}

export type MLErrorKind = "timeout" | "server" | "network" | "none";

export interface MLResult<T> {
  data: T | null;
  errorKind: MLErrorKind;
  latencyMs: number;
}

// ─── Adaptive quality tracker ─────────────────────────────────────────────────

/**
 * Tracks rolling average latency and suggests a JPEG quality value (0.2–0.5).
 * Called by the camera hook — not exported to components.
 */
class AdaptiveQuality {
  private samples: number[] = [];
  private readonly maxSamples = 6;

  record(latencyMs: number) {
    this.samples.push(latencyMs);
    if (this.samples.length > this.maxSamples) this.samples.shift();
  }

  /** Returns 0.2–0.5 depending on avg latency. Lower latency → higher quality. */
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

/** Prevents stacking requests for the same step if the previous hasn't returned yet */
const inFlight = new Set<MLStep>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Strips the data-URL prefix expo-camera sometimes prepends to base64 output.
 */
export function stripDataUrlPrefix(base64: string): string {
  const idx = base64.indexOf(",");
  return idx !== -1 ? base64.slice(idx + 1) : base64;
}

/**
 * Core POST with:
 *  - AbortController timeout
 *  - Exponential backoff retries (network errors only, not 4xx)
 *  - Latency measurement for adaptive quality
 */
async function postFrame<T>(
  endpoint: string,
  payload: FramePayload,
  step: MLStep,
): Promise<MLResult<T>> {
  // Skip if a request for this step is already in flight
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

      // Network error — retry with backoff
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
 * STEP 1 — Head Movement Detection
 * POST /head-movement
 * Response: { success: boolean, message?: string }
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
 * Response: { success: boolean, blink_count?: number, message?: string }
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
 * Response: { matched: boolean, confidence: number, user_id?: string }
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
