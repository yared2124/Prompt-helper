import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, GenerateResponse } from "@/types";
import { AI_MODELS, PROMPT_STRATEGIES } from "@/data/aiModels";
import { DOMAINS } from "@/data/domains";
import { cleanPromptFormatting } from "@/lib/cleanPrompt";

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

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Generation timed out after ${ms / 1000}s`)), ms)
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
                `Tailor the prompt variables to your specific tech stack and dependencies`,
                `Demarcate user context from core instructions`,
                `Specify explicit validation criteria in ${aiName}`,
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
      `Tailor the prompt variables to your specific tech stack and dependencies`,
      `Demarcate user context from core instructions`,
      `Specify explicit validation criteria in ${aiName}`,
    ],
  };
}

const MODEL_SPECIFIC_INSTRUCTIONS: Record<string, string> = {
  claude: `Use clean XML structural tags (<role>, <context>, <instructions>, <requirements>, <output_format>). Do not use markdown hashes or asterisks. Claude adheres with supreme fidelity to clean XML tag hierarchies.`,
  chatgpt: `Use clean uppercase section headings: ROLE:, CONTEXT:, TASK:, CONSTRAINTS:, and OUTPUT FORMAT:. Use clean hyphens ('- ') for bulleted lists.`,
  gemini: `Use a clean hierarchical layout: SYSTEM ROLE:, CONTEXT & GROUNDING:, DIRECTIVES:, and FORMAT SPECIFICATION:. Highlight multimodality and massive context capabilities.`,
  deepseek: `Use a rigorous reasoning structure: ROLE:, PROBLEM SPECIFICATION:, CHAIN-OF-THOUGHT & VERIFICATION PROTOCOL:, CONSTRAINTS:, and DELIVERABLE:. Emphasize step-by-step logic and mathematical/algorithmic precision.`,
  grok: `Use direct, candid section headers: ROLE:, MISSION:, REAL-TIME & DATA CONSTRAINTS:, and OUTPUT REQUIREMENTS:. Zero filler or fluff.`,
  mistral: `Use dense, high-efficiency technical blocks: ROLE:, TECHNICAL OBJECTIVE:, IMPLEMENTATION SPECIFICATION:, and OUTPUT FORMAT:. Concise, unambiguous European open-weight style.`,
  llama: `Use system-instruction-ready architecture: SYSTEM:, USER INSTRUCTION:, CONSTRAINTS:, and RESPONSE TEMPLATE:. Deterministic, explicit, and direct.`,
  perplexity: `Use research-grade architecture: ROLE:, RESEARCH INQUIRY:, SOURCE & VERIFICATION CRITERIA:, and SYNTHESIS FORMAT:. Focus on factual grounding and citation readiness.`,
  cohere: `Use enterprise RAG architecture: ROLE:, RETRIEVAL & EXTRACTION CONTEXT:, GROUNDING RULES:, and RESPONSE STRUCTURE:. Grounded, hallucination-free output.`,
  qwen: `Use benchmark-grade technical structure: ROLE:, TECHNICAL SCOPE:, STEP-BY-STEP CONSTRAINTS:, and STRUCTURED DELIVERABLE:. Precision syntax and multilingual mastery.`,
};

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
- Require edge-case handling, performance considerations (O(n) bounds), and unit test requirements.
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

    const modelGuide =
      MODEL_SPECIFIC_INSTRUCTIONS[selectedAI.id] ||
      `Use clean uppercase section headings (ROLE:, CONTEXT:, TASK:, CONSTRAINTS:, OUTPUT FORMAT:) with clean hyphens ('- ') for bulleted lists.`;

    const metaPrompt = `You are a world-class prompt architect and engineer. Your task is to transform a user's rough idea into a formalized, production-ready, perfectly structured prompt for ${selectedAI.name} (${selectedAI.provider}${targetModel ? ` - ${targetModel}` : ""}).

USER'S ORIGINAL GOAL: "${cleanInput}"
TARGET AI: ${selectedAI.name} (${selectedAI.provider})
TARGET SPECIFIC MODEL: ${targetModel || selectedAI.selectedModel}
DOMAIN: ${selectedDomain.name}
${selectedAI.name}'S STRENGTHS & IDIOMS: ${selectedAI.strengths.join(", ")}
${strategyInstructions}

ARCHITECTURE SPECIFICATION FOR ${selectedAI.name.toUpperCase()}:
${modelGuide}

CRITICAL OUTPUT RULES (STRICTLY FORBIDDEN: '#' AND '*'):
1. DO NOT use markdown heading hashes ('#', '##', '###', '####'). Never prefix titles with '#' or '###'. Use clean uppercase titles followed by a colon (e.g., ROLE:, TASK:, SPECIFICATIONS:, CONSTRAINTS:, OUTPUT FORMAT:) or XML tags for Claude.
2. DO NOT use asterisks ('*', '**', '***') anywhere. No '**bold**', no '*bullet*', no '***italics***'.
3. For bulleted lists, ALWAYS use clean hyphens ('- ') or numbered items ('1. ', '2. ').
4. For emphasis, use UPPERCASE words or clear plain phrasing, NEVER asterisks.
5. Complete the entire prompt thoroughly without cutting off or leaving sentences uncompleted.

Respond with a JSON object in this exact schema:
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
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3-flash-preview",
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
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
              responseJsonSchema: {
                type: "OBJECT",
                properties: {
                  enhancedPrompt: {
                    type: "STRING",
                    description:
                      "The complete engineered prompt ready to paste directly into the target AI model.",
                  },
                  tips: {
                    type: "ARRAY",
                    items: {
                      type: "STRING",
                    },
                    description:
                      "3 actionable tips for maximizing output quality with this model.",
                  },
                },
                required: ["enhancedPrompt", "tips"],
              },
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

    // Resiliently parse and sanitize output
    const parsed = parseGeneratedOutput(rawText, selectedAI.name);
    const cleanedPrompt = cleanPromptFormatting(parsed.enhancedPrompt);
    const cleanedTips = (parsed.tips || []).map((t) => cleanPromptFormatting(t));

    const tokensBefore = estimateTokens(userInput);
    const tokensAfter = estimateTokens(cleanedPrompt);

    const result: GenerateResponse = {
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
    console.error("Error generating prompt:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
