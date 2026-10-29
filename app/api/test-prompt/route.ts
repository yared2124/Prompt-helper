import { NextRequest, NextResponse } from "next/server";
import { TestPromptRequest, TestPromptResponse } from "@/types";
import {
  estimateTokens,
  generateWithFallback,
  rateLimited,
} from "@/lib/gemini";

async function executePrompt(promptText: string): Promise<string> {
  const response = await generateWithFallback(promptText, {
    temperature: 0.7,
    maxOutputTokens: 3000,
  });
  return response.trim();
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

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
