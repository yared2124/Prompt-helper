import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { RefinePromptRequest, RefinePromptResponse } from "@/types";
import { AI_MODELS } from "@/data/aiModels";
import { DOMAINS } from "@/data/domains";
import { cleanPromptFormatting } from "@/lib/cleanPrompt";

function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function sanitizeInput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Refinement timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

function parseGeneratedOutput(
  rawText: string,
  aiName: string
): { enhancedPrompt: string; tips: string[] } {
  const stripped = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 1. Try standard JSON parse
  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed.enhancedPrompt === "string") {
      return {
        enhancedPrompt: parsed.enhancedPrompt,
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      };
    }
  } catch {}

  // 2. Resilient regex extraction if output is malformed or truncated
  const promptKeyMatch = /"enhancedPrompt"\s*:\s*"/i.exec(stripped);
  if (promptKeyMatch) {
    let content = stripped.slice(promptKeyMatch.index + promptKeyMatch[0].length);
    const endMatch = /",\s*"tips"/i.exec(content);
    if (endMatch) {
      content = content.slice(0, endMatch.index);
    } else {
      content = content.replace(/"\s*(?:,\s*"tips"[\s\S]*)?\}?\s*$/i, "");
      content = content.replace(/"\s*$/i, "");
    }

    try {
      content = JSON.parse(`"${content.replace(/"/g, '\\"')}"`);
    } catch {
      content = content
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "  ")
        .replace(/\\\\/g, "\\");
    }

    const tips: string[] = [];
    const tipsMatch = /"tips"\s*:\s*\[([\s\S]*?)\]/i.exec(stripped);
    if (tipsMatch) {
      const items = tipsMatch[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
      if (items) {
        for (const item of items) {
          tips.push(item.slice(1, -1).replace(/\\"/g, '"'));
        }
      }
    }

    if (content.trim()) {
      return {
        enhancedPrompt: content.trim(),
        tips:
          tips.length > 0
            ? tips
            : [
                `Refined to apply: specific adjustments requested`,
                `Preserves core architectural guidelines for ${aiName}`,
                `Ready for immediate production use`,
              ],
      };
    }
  }

  // 3. Fallback: Strip JSON wrappers and unescape text
  return {
    enhancedPrompt: stripped
      .replace(/^\s*\{\s*"enhancedPrompt"\s*:\s*"?/i, "")
      .replace(/"\s*(?:,\s*"tips"[\s\S]*)?\}?\s*$/i, "")
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .trim(),
    tips: [
      `Refined to apply: specific adjustments requested`,
      `Preserves core architectural guidelines for ${aiName}`,
      `Ready for immediate production use`,
    ],
  };
}

const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
];

export async function POST(request: NextRequest) {
  try {
    const body: RefinePromptRequest = await request.json();
    const { currentPrompt, refinementInstruction, aiModelId, domainId } = body;

    if (!currentPrompt || typeof currentPrompt !== "string") {
      return NextResponse.json(
        { error: "Missing required field: currentPrompt" },
        { status: 400 }
      );
    }

    if (!refinementInstruction || typeof refinementInstruction !== "string") {
      return NextResponse.json(
        { error: "Missing required field: refinementInstruction" },
        { status: 400 }
      );
    }

    const cleanPrompt = sanitizeInput(currentPrompt);
    const cleanInstruction = sanitizeInput(refinementInstruction);

    if (cleanPrompt.length < 3) {
      return NextResponse.json(
        { error: "Current prompt is too short to refine." },
        { status: 400 }
      );
    }

    if (cleanInstruction.length < 2) {
      return NextResponse.json(
        { error: "Refinement instruction is too short." },
        { status: 400 }
      );
    }

    if (cleanPrompt.length > 12000) {
      return NextResponse.json(
        { error: "Current prompt exceeds the 12,000 character limit." },
        { status: 400 }
      );
    }

    if (cleanInstruction.length > 1000) {
      return NextResponse.json(
        { error: "Refinement instruction exceeds the 1,000 character limit." },
        { status: 400 }
      );
    }

    const selectedAI = aiModelId
      ? AI_MODELS.find((m) => m.id === aiModelId)
      : undefined;
    const aiName = selectedAI ? selectedAI.name : "Target AI Model";

    const selectedDomain = domainId
      ? DOMAINS.find((d) => d.id === domainId)
      : undefined;

    const isClaude = selectedAI?.id === "claude";

    const metaPrompt = `You are a world-class prompt architect and engineer.
Your mission is to REFINE and ENHANCE an existing prompt according to a user's refinement directive.
Preserve the existing high-value context, role definitions, and core constraints, while surgically applying the requested modification.

CURRENT PROMPT TO REFINE:
"""
${cleanPrompt}
"""

REFINEMENT INSTRUCTION:
"""
${cleanInstruction}
"""

TARGET MODEL CONTEXT:
Model: ${aiName}${selectedAI ? ` (${selectedAI.provider})` : ""}
${selectedDomain ? `Domain: ${selectedDomain.name}` : ""}

CRITICAL OUTPUT RULES (STRICTLY FORBIDDEN: '#' AND '*'):
1. DO NOT use markdown heading hashes ('#', '##', '###', '####'). Use uppercase titles followed by a colon (e.g. ROLE:, TASK:, CONSTRAINTS:, OUTPUT FORMAT:) or XML tags if targeting Claude.
2. DO NOT use asterisks ('*', '**', '***') anywhere. No bold asterisks, no italic asterisks, no asterisk bullet points.
3. For bullet points, ALWAYS use clean hyphens ('- ') or numbers ('1. ').
4. Keep the output 100% complete and polished without truncating.

Respond with a JSON object in this exact schema:
{
  "enhancedPrompt": "The refined, fully updated prompt ready for immediate use",
  "tips": [
    "Refinement tip 1 explaining what was improved",
    "Refinement tip 2",
    "Refinement tip 3"
  ]
}`;

    const ai = getAIClient();
    let rawText = "";
    let lastErr: unknown = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: metaPrompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
              responseJsonSchema: {
                type: "OBJECT",
                properties: {
                  enhancedPrompt: {
                    type: "STRING",
                    description: "The refined engineered prompt.",
                  },
                  tips: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "3 actionable tips reflecting the refinement.",
                  },
                },
                required: ["enhancedPrompt", "tips"],
              },
            },
          }),
          25000
        );
        rawText = response.text ?? "";
        if (rawText) break;
      } catch (err) {
        lastErr = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Refine model ${modelName} issue: ${errMsg}. Trying fallback...`);
      }
    }

    if (!rawText && lastErr) {
      throw lastErr;
    }

    const parsed = parseGeneratedOutput(rawText, aiName);
    const cleanedPrompt = cleanPromptFormatting(parsed.enhancedPrompt);
    const cleanedTips = (parsed.tips || []).map((t) => cleanPromptFormatting(t));

    const tokensBefore = estimateTokens(cleanPrompt);
    const tokensAfter = estimateTokens(cleanedPrompt);

    const result: RefinePromptResponse = {
      enhancedPrompt: cleanedPrompt,
      tips: cleanedTips,
      tokensBefore,
      tokensAfter,
      metrics: {
        roleDetected:
          cleanedPrompt.toLowerCase().includes("you are") ||
          cleanedPrompt.toLowerCase().includes("role"),
        constraintsDetected:
          cleanedPrompt.includes("<") ||
          cleanedPrompt.toLowerCase().includes("constraint") ||
          cleanedPrompt.toLowerCase().includes("must"),
        outputFormatDetected:
          cleanedPrompt.toLowerCase().includes("format") ||
          cleanedPrompt.toLowerCase().includes("schema"),
        savingsPercentage: Math.round(
          ((tokensAfter - tokensBefore) / Math.max(tokensBefore, 1)) * 100
        ),
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

    console.error("Error refining prompt:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
