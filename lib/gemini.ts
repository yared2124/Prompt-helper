import { GoogleGenAI } from "@google/genai";

export function getAIClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export const MODELS = [
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  process.env.GEMINI_FALLBACK_MODEL,
].filter(Boolean) as string[];

export const estimateTokens = (t: string) => Math.max(1, Math.ceil(t.length / 4));

export const sanitizeInput = (t: string) =>
  t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

export function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  let id: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => {
    id = setTimeout(() => rej(new Error(`Timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(id));
}

export async function generateWithFallback(
  contents: string,
  config: Record<string, unknown>
): Promise<string> {
  const ai = getAIClient();
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({ model, contents, config })
      );
      if (res.text) return res.text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("No response generated");
}

// Per-instance only; use a platform limiter or shared store for distributed deployments.
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}