import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { TestPromptRequest, TestPromptResponse } from "@/types";

function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Execution timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
];

async function executePrompt(promptText: string): Promise<string> {
  const ai = getAIClient();
  let lastErr: unknown = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            temperature: 0.7,
            maxOutputTokens: 3000,
          },
        }),
        25000
      );

      const text = response.text?.trim();
      if (text) return text;
    } catch (err) {
      lastErr = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Sandbox model ${modelName} issue: ${errMsg}. Trying fallback...`);
    }
  }

  if (lastErr) throw lastErr;
  return "No response generated.";
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body: TestPromptRequest = await request.json();
    const { prompt, originalInput, compareOriginal } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 3) {
      return NextResponse.json(
        { error: "Prompt is too short to test. Provide at least 3 characters." },
        { status: 400 }
      );
    }

    if (cleanPrompt.length > 6000) {
      return NextResponse.json(
        { error: "Prompt exceeds the 6,000 character testing limit." },
        { status: 400 }
      );
    }

    // Execute the main engineered prompt
    const enhancedResponse = await executePrompt(cleanPrompt);

    // Optionally execute the original casual prompt for comparison
    let originalResponse: string | undefined = undefined;
    if (compareOriginal && originalInput && originalInput.trim().length >= 3) {
      try {
        originalResponse = await executePrompt(originalInput.trim());
      } catch (compareErr) {
        console.warn("Failed to generate comparative original response:", compareErr);
      }
    }

    const executionTimeMs = Math.round(performance.now() - startTime);
    const tokensUsed = estimateTokens(enhancedResponse);

    const result: TestPromptResponse = {
      response: enhancedResponse,
      originalResponse,
      executionTimeMs,
      tokensUsed,
    };

    return NextResponse.json(result);
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    try {
      const parsedJson = JSON.parse(message);
      if (parsedJson?.error?.message) {
        message = parsedJson.error.message;
      }
    } catch {}

    console.error("Error executing test prompt sandbox:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
