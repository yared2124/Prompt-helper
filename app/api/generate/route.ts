import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "@/types";
import { AI_MODELS, PROMPT_STRATEGIES } from "@/data/aiModels";
import { DOMAINS } from "@/data/domains";

// Lazy init — only runs at request time, not during build
function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function estimateTokens(text: string): number {
  // Standard token estimate (~4 chars per token)
  return Math.max(1, Math.ceil(text.length / 4));
}

function sanitizeInput(text: string): string {
  // Remove dangerous non-printable ASCII control characters except tab and newline
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Generation timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { userInput, aiModelId, domainId, strategyId, targetModel } = body;

    if (!userInput || !aiModelId || !domainId) {
      return NextResponse.json(
        { error: "Missing required fields: userInput, aiModelId, domainId" },
        { status: 400 }
      );
    }

    const cleanInput = sanitizeInput(userInput);
    if (cleanInput.length < 3) {
      return NextResponse.json(
        { error: "Input prompt is too short. Please provide at least 3 characters." },
        { status: 400 }
      );
    }

    if (cleanInput.length > 2000) {
      return NextResponse.json(
        { error: "Input prompt exceeds the 2,000 character limit." },
        { status: 400 }
      );
    }

    const selectedAI = AI_MODELS.find((m) => m.id === aiModelId);
    const selectedDomain = DOMAINS.find((d) => d.id === domainId);
    const selectedStrategy =
      PROMPT_STRATEGIES.find((s) => s.id === strategyId) ||
      PROMPT_STRATEGIES[0];

    if (!selectedAI || !selectedDomain) {
      return NextResponse.json(
        { error: "Invalid AI model or domain" },
        { status: 400 }
      );
    }

    let strategyInstructions = "";
    if (strategyId === "tokensaver") {
      strategyInstructions = `
CRITICAL STRATEGY (TOKEN SAVER):
- Extreme conciseness and zero filler.
- Do NOT use conversational introductions, greetings, or polite closings.
- Use dense structural notation or compressed bullet points.
- Target minimum token usage while preserving maximum technical fidelity.`;
    } else if (strategyId === "production") {
      strategyInstructions = `
CRITICAL STRATEGY (PRODUCTION STRICT):
- Enforce strict typing, validation schemas, and failure/error recovery cases.
- Require edge-case handling, performance considerations ($O(n)$ bounds), and unit test requirements.
- Mandate exact output structure with zero omissions.`;
    } else if (strategyId === "reasoning") {
      strategyInstructions = `
CRITICAL STRATEGY (DEEP REASONING):
- Instruct the AI to explicitly use step-by-step thinking, chain-of-thought analysis, and self-verification.
- Ask the AI to identify potential pitfalls and verify edge cases before generating the final solution.`;
    } else {
      strategyInstructions = `
CRITICAL STRATEGY (STANDARD BALANCED):
- Balanced clarity, explicit role definition, clear constraints, and clean formatting.`;
    }

    const metaPrompt = `You are a world-class prompt architect and engineer. Your task is to transform a user's rough idea into a perfectly crafted, production-ready prompt for ${selectedAI.name} (${selectedAI.provider}${targetModel ? ` - ${targetModel}` : ""}).

USER'S ORIGINAL GOAL: "${cleanInput}"
TARGET AI: ${selectedAI.name} (${selectedAI.provider})
TARGET SPECIFIC MODEL: ${targetModel || selectedAI.selectedModel}
DOMAIN: ${selectedDomain.name}
${selectedAI.name}'S STRENGTHS & IDIOMS: ${selectedAI.strengths.join(", ")}
${strategyInstructions}

GUIDELINES FOR ${selectedAI.name}:
- For Claude: Prefer XML tags (<context>, <instructions>, <requirements>, <output_format>) as Claude adheres to XML tags with supreme accuracy.
- For ChatGPT / OpenAI: Use Markdown headings, explicit system constraints, role definitions, and few-shot or schema definitions.
- For Gemini: Emphasize multimodal or contextual reasoning, clear instruction hierarchy, and structured tables/markdown.
- For DeepSeek / Reasoning models: Emphasize chain-of-thought, mathematical/algorithmic rigor, and step-by-step logic.
- For Open Weights (LLaMA / Mistral): Use concise, unambiguous directives and explicit format templates.

Respond with a JSON object in this exact format (no surrounding markdown, no extra commentary, just valid JSON):
{
  "enhancedPrompt": "The complete engineered prompt ready to paste directly into ${selectedAI.name}",
  "tips": [
    "Expert tip 1 specific to ${selectedAI.name} in ${selectedDomain.name}",
    "Expert tip 2",
    "Expert tip 3"
  ]
}`;

    const ai = getAIClient();
    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3-flash-preview",
      "gemini-3.5-flash-lite",
    ];
    let rawText = "";
    let lastErr: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: metaPrompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 1500,
            },
          }),
          25000
        );
        rawText = response.text ?? "";
        if (rawText) break; // success
      } catch (err) {
        lastErr = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Model ${modelName} encountered issue: ${errMsg}. Trying fallback...`);
      }
    }

    if (!rawText && lastErr) {
      throw lastErr;
    }

    // Parse the JSON response from Gemini
    let parsed: { enhancedPrompt: string; tips: string[] };
    try {
      const jsonStr = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        enhancedPrompt: rawText,
        tips: [
          `Leverage ${selectedAI.name}'s specific system instruction capabilities`,
          `Keep constraints clearly demarcated from user context`,
          `Specify desired output format explicitly`,
        ],
      };
    }

    const tokensBefore = estimateTokens(userInput);
    const tokensAfter = estimateTokens(parsed.enhancedPrompt);

    const result: GenerateResponse = {
      enhancedPrompt: parsed.enhancedPrompt,
      tips: parsed.tips || [],
      tokensBefore,
      tokensAfter,
      metrics: {
        roleDetected: parsed.enhancedPrompt.toLowerCase().includes("you are") || parsed.enhancedPrompt.toLowerCase().includes("role"),
        constraintsDetected: parsed.enhancedPrompt.includes("<") || parsed.enhancedPrompt.toLowerCase().includes("constraint") || parsed.enhancedPrompt.toLowerCase().includes("must"),
        outputFormatDetected: parsed.enhancedPrompt.toLowerCase().includes("format") || parsed.enhancedPrompt.toLowerCase().includes("schema"),
        savingsPercentage: Math.round(((tokensAfter - tokensBefore) / Math.max(tokensBefore, 1)) * 100),
      },
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
    console.error("Error generating prompt:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
