/**
 * Load Balancer & Fast Response Engine for Gemini API
 *
 * Strategies:
 *  1. Multi-Key Load Balancing — Distribute across multiple API keys (round-robin / failover).
 *  2. Health-Aware Dynamic Routing — Route to the lowest-latency healthy model first.
 *  3. Fast Adaptive Timeout — Fail over quickly (e.g. 8-12s) if a model is stalling.
 *  4. In-Memory Response Caching — Return identical prompts in ~0ms.
 *  5. In-Flight Request Deduplication — Coalesce concurrent identical requests.
 *  6. Circuit Breaker — Skip failing or rate-limited models until recovery period passes.
 *  7. Leak-Free Timers — Timers unref'd and cleared in finally blocks for zero memory leaks.
 */

import { GoogleGenAI } from "@google/genai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModelHealth {
  name: string;
  avgLatencyMs: number;
  successCount: number;
  failCount: number;
  lastUsed: number;
  lastError: string | null;
  consecutiveFailures: number;
}

interface CacheEntry {
  value: string;
  timestamp: number;
  ttl: number;
}

export interface GenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseJsonSchema?: Record<string, unknown>;
}

export interface LoadBalancedResult {
  text: string;
  model: string;
  latencyMs: number;
  cached?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
] as const;

// Cache TTL: 5 minutes for identical prompt requests
const CACHE_TTL_MS = 5 * 60 * 1000;

// Max cache entries
const MAX_CACHE_SIZE = 100;

// Base timeout per attempt (in ms). Keeps latency low by failing over fast
const DEFAULT_TIMEOUT_MS = 12000;
const MIN_TIMEOUT_MS = 6000;
const MAX_TIMEOUT_MS = 25000;

// Moving average window
const LATENCY_WINDOW = 10;

// Circuit breaker: skip model after this many consecutive failures
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RECOVERY_MS = 60000;

// ─── State ───────────────────────────────────────────────────────────────────

let keyIndex = 0;

const modelHealth: Map<string, ModelHealth> = new Map(
  CANDIDATE_MODELS.map((name) => [
    name,
    {
      name,
      avgLatencyMs: 1500,
      successCount: 0,
      failCount: 0,
      lastUsed: 0,
      lastError: null,
      consecutiveFailures: 0,
    },
  ])
);

const latencyHistory: Map<string, number[]> = new Map(
  CANDIDATE_MODELS.map((name) => [name, []])
);

const responseCache: Map<string, CacheEntry> = new Map();
const inflightRequests: Map<string, Promise<LoadBalancedResult>> = new Map();

// ─── Key Management & Client Factory ─────────────────────────────────────────

export function getApiKeys(): string[] {
  // Support both comma-separated GEMINI_API_KEYS and single GEMINI_API_KEY
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    const parsed = multiKeys
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (parsed.length > 0) return parsed;
  }

  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey) {
    return [singleKey.trim()];
  }

  throw new Error("GEMINI_API_KEY is not set in .env.local");
}

/** Get next API key using round-robin distribution */
export function getNextApiKey(): string {
  const keys = getApiKeys();
  const key = keys[keyIndex % keys.length];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
}

export function getAIClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || getNextApiKey();
  return new GoogleGenAI({ apiKey: key });
}

// ─── Utility Functions ───────────────────────────────────────────────────────

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function sanitizeInput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

/** Generate a stable cache key */
function getCacheKey(contents: string, config: GenerateOptions): string {
  const configStr = `${config.temperature ?? 0.7}|${config.maxOutputTokens ?? 4096}|${config.responseMimeType || ""}`;
  const contentKey =
    contents.length <= 200
      ? contents
      : `${contents.slice(0, 100)}...${contents.slice(-100)}|len=${contents.length}`;
  return `${contentKey}||${configStr}`;
}

function evictCache(): void {
  if (responseCache.size <= MAX_CACHE_SIZE) return;
  const entries = Array.from(responseCache.entries());
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
  for (const [key] of toRemove) {
    responseCache.delete(key);
  }
}

function getCachedResponse(key: string): string | null {
  if (process.env.NODE_ENV === "test") {
    return null; // Avoid cache pollution between mock test runs
  }
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedResponse(key: string, value: string): void {
  if (process.env.NODE_ENV === "test") return;
  responseCache.set(key, {
    value,
    timestamp: Date.now(),
    ttl: CACHE_TTL_MS,
  });
  evictCache();
}

// ─── Health Scoring & Routing ────────────────────────────────────────────────

function recordSuccess(modelName: string, latencyMs: number): void {
  const health = modelHealth.get(modelName);
  if (!health) return;

  health.successCount++;
  health.consecutiveFailures = 0;
  health.lastUsed = Date.now();
  health.lastError = null;

  const history = latencyHistory.get(modelName) || [];
  history.push(latencyMs);
  if (history.length > LATENCY_WINDOW) history.shift();
  latencyHistory.set(modelName, history);
  health.avgLatencyMs = history.reduce((a, b) => a + b, 0) / history.length;
}

function recordFailure(modelName: string, error: string): void {
  const health = modelHealth.get(modelName);
  if (!health) return;

  health.failCount++;
  health.consecutiveFailures++;
  health.lastUsed = Date.now();
  health.lastError = error;
}

function scoreModel(health: ModelHealth): number {
  if (
    health.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD &&
    Date.now() - health.lastUsed < CIRCUIT_BREAKER_RECOVERY_MS
  ) {
    return Infinity; // Circuit breaker open
  }

  const totalRequests = health.successCount + health.failCount;
  const errorRate = totalRequests > 0 ? health.failCount / totalRequests : 0;
  return health.avgLatencyMs + errorRate * 5000;
}

/** Get candidate models ordered by health & latency (lowest latency first) */
export function getPrioritizedModels(): string[] {
  const scored = Array.from(modelHealth.values())
    .map((h) => ({ name: h.name, score: scoreModel(h) }))
    .filter((m) => m.score < Infinity)
    .sort((a, b) => a.score - b.score);

  if (scored.length === 0) {
    // Reset circuit breakers if all are tripping
    modelHealth.forEach((health) => {
      health.consecutiveFailures = 0;
    });
    return [...CANDIDATE_MODELS];
  }

  // Append any circuit-broken models to the end as last-resort fallbacks
  const availableSet = new Set(scored.map((s) => s.name));
  const fallbacks = [...CANDIDATE_MODELS].filter((m) => !availableSet.has(m));

  return [...scored.map((m) => m.name), ...fallbacks];
}

function getAdaptiveTimeout(modelName: string): number {
  const health = modelHealth.get(modelName);
  if (!health || health.successCount < 3) return DEFAULT_TIMEOUT_MS;

  const adaptive = Math.round(health.avgLatencyMs * 2.5);
  return Math.min(Math.max(adaptive, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
}

// ─── Model Invocation with Leak-Free Timers ───────────────────────────────────

async function invokeModel(
  modelName: string,
  contents: string,
  config: GenerateOptions
): Promise<LoadBalancedResult> {
  const ai = getAIClient();
  const timeoutMs = getAdaptiveTimeout(modelName);
  const startTime = performance.now();

  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Model ${modelName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  });

  const apiPromise = ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 4096,
      responseMimeType: config.responseMimeType,
      responseJsonSchema: config.responseJsonSchema,
    },
  });

  try {
    const response = await Promise.race([apiPromise, timeoutPromise]);
    const latencyMs = Math.round(performance.now() - startTime);
    const text = response.text?.trim() ?? "";

    if (!text) {
      throw new Error(`Model ${modelName} returned empty text`);
    }

    recordSuccess(modelName, latencyMs);
    return { text, model: modelName, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errMsg = err instanceof Error ? err.message : String(err);
    recordFailure(modelName, errMsg);
    throw err;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

// ─── Primary Load Balanced Generator ─────────────────────────────────────────

/**
 * Load-balanced prompt generation:
 * 1. Checks memory cache (0ms latency).
 * 2. Deduplicates concurrent in-flight requests.
 * 3. Tries the fastest, healthiest model first.
 * 4. Fails over immediately to next prioritized model if any error/timeout occurs.
 * 5. Balances across multiple API keys if configured.
 */
export async function loadBalancedGenerate(
  contents: string,
  config: GenerateOptions = {}
): Promise<LoadBalancedResult> {
  const cacheKey = getCacheKey(contents, config);

  // 1. In-memory cache hit
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return { text: cached, model: "cache", latencyMs: 0, cached: true };
  }

  // 2. In-flight request deduplication
  const inflight = inflightRequests.get(cacheKey);
  if (inflight) {
    return await inflight;
  }

  // 3. Execute with prioritized failover
  const requestPromise = (async () => {
    const models = getPrioritizedModels();
    let lastErr: unknown = null;

    for (const modelName of models) {
      try {
        const result = await invokeModel(modelName, contents, config);
        setCachedResponse(cacheKey, result.text);
        return result;
      } catch (err) {
        lastErr = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[LoadBalancer] Model ${modelName} failed (${errMsg}). Failing over to next model...`);
      }
    }

    throw lastErr || new Error("All candidate AI models failed to respond.");
  })();

  inflightRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

// ─── Diagnostics & Health Stats ──────────────────────────────────────────────

export function getHealthStats(): Record<string, unknown>[] {
  return Array.from(modelHealth.values()).map((h) => ({
    model: h.name,
    avgLatencyMs: Math.round(h.avgLatencyMs),
    successRate:
      h.successCount + h.failCount > 0
        ? `${Math.round((h.successCount / (h.successCount + h.failCount)) * 100)}%`
        : "N/A",
    successCount: h.successCount,
    failCount: h.failCount,
    consecutiveFailures: h.consecutiveFailures,
    circuitBroken:
      h.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD &&
      Date.now() - h.lastUsed < CIRCUIT_BREAKER_RECOVERY_MS,
    lastError: h.lastError,
  }));
}

export function getCacheStats(): { size: number; maxSize: number } {
  return { size: responseCache.size, maxSize: MAX_CACHE_SIZE };
}

/** Reset state for tests */
export function resetLoadBalancerState(): void {
  responseCache.clear();
  inflightRequests.clear();
  modelHealth.forEach((h) => {
    h.consecutiveFailures = 0;
    h.failCount = 0;
    h.successCount = 0;
    h.lastError = null;
    h.avgLatencyMs = 1500;
  });
  latencyHistory.forEach((arr) => {
    arr.length = 0;
  });
}
