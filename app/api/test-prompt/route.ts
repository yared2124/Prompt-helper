import { NextRequest, NextResponse } from "next/server";
import { TestPromptRequest, TestPromptResponse } from "@/types";
import { loadBalancedGenerate, estimateTokens } from "@/lib/loadBalancer";

async function executePrompt(promptText: string): Promise<string> {
  const result = await loadBalancedGenerate(promptText, {
    temperature: 0.7,
    maxOutputTokens: 3000,
  });
  return result.text;
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

    const response = NextResponse.json(result);
    response.headers.set("X-Response-Time", `${executionTimeMs}ms`);
    response.headers.set("Cache-Control", "private, max-age=300");
    return response;
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
