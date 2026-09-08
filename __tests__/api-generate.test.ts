/**
 * API route handler tests — validates request validation, error handling,
 * and response structure without calling the real Gemini API.
 *
 * @jest-environment node
 */

// Mock the GoogleGenAI module before importing the route
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          enhancedPrompt: "You are an expert Python developer...",
          tips: ["Use type hints", "Add docstrings", "Write tests"],
        }),
      }),
    },
  })),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/generate/route";

// Ensure GEMINI_API_KEY is set for tests
beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-api-key-for-jest";
});

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/generate", () => {
  // ── Validation ──────────────────────────────────────────────────────────

  it("returns 400 when userInput is missing", async () => {
    const res = await POST(makeRequest({ aiModelId: "claude", domainId: "coding" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing required fields/);
  });

  it("returns 400 when aiModelId is missing", async () => {
    const res = await POST(makeRequest({ userInput: "test prompt", domainId: "coding" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing required fields/);
  });

  it("returns 400 when domainId is missing", async () => {
    const res = await POST(makeRequest({ userInput: "test prompt", aiModelId: "claude" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing required fields/);
  });

  it("returns 400 when input is too short (< 3 chars after sanitize)", async () => {
    const res = await POST(
      makeRequest({ userInput: "ab", aiModelId: "claude", domainId: "coding" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/too short/);
  });

  it("returns 400 when input exceeds 2000 characters", async () => {
    const res = await POST(
      makeRequest({
        userInput: "x".repeat(2001),
        aiModelId: "claude",
        domainId: "coding",
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/2,000 character limit/);
  });

  it("returns 400 for invalid aiModelId", async () => {
    const res = await POST(
      makeRequest({
        userInput: "Write a Python script",
        aiModelId: "nonexistent-model",
        domainId: "coding",
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid AI model or domain/);
  });

  it("returns 400 for invalid domainId", async () => {
    const res = await POST(
      makeRequest({
        userInput: "Write a Python script",
        aiModelId: "claude",
        domainId: "nonexistent-domain",
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid AI model or domain/);
  });

  // ── Successful generation ───────────────────────────────────────────────

  it("returns 200 with valid GenerateResponse on success", async () => {
    const res = await POST(
      makeRequest({
        userInput: "Write a REST API in Python",
        aiModelId: "claude",
        domainId: "coding",
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();

    // Response shape
    expect(json).toHaveProperty("enhancedPrompt");
    expect(json).toHaveProperty("tips");
    expect(json).toHaveProperty("tokensBefore");
    expect(json).toHaveProperty("tokensAfter");
    expect(json).toHaveProperty("metrics");

    // Types
    expect(typeof json.enhancedPrompt).toBe("string");
    expect(Array.isArray(json.tips)).toBe(true);
    expect(typeof json.tokensBefore).toBe("number");
    expect(typeof json.tokensAfter).toBe("number");
  });

  it("metrics contains expected boolean detection flags", async () => {
    const res = await POST(
      makeRequest({
        userInput: "Write a REST API in Python",
        aiModelId: "claude",
        domainId: "coding",
        strategyId: "balanced",
      })
    );
    const json = await res.json();
    const { metrics } = json;

    expect(typeof metrics.roleDetected).toBe("boolean");
    expect(typeof metrics.constraintsDetected).toBe("boolean");
    expect(typeof metrics.outputFormatDetected).toBe("boolean");
    expect(typeof metrics.savingsPercentage).toBe("number");
  });

  it("accepts all valid AI model IDs", async () => {
    const modelIds = [
      "claude", "chatgpt", "gemini", "deepseek", "grok",
      "mistral", "llama", "perplexity", "cohere", "qwen",
    ];
    for (const aiModelId of modelIds) {
      const res = await POST(
        makeRequest({
          userInput: "Test prompt for validation",
          aiModelId,
          domainId: "coding",
        })
      );
      expect(res.status).toBe(200);
    }
  });

  it("accepts all valid domain IDs", async () => {
    const domainIds = [
      "coding", "education", "writing", "research", "business",
      "art", "data", "ai", "health", "language", "legal", "productivity",
    ];
    for (const domainId of domainIds) {
      const res = await POST(
        makeRequest({
          userInput: "Test prompt for validation",
          aiModelId: "claude",
          domainId,
        })
      );
      expect(res.status).toBe(200);
    }
  });

  it("accepts all strategy IDs", async () => {
    const strategyIds = ["balanced", "tokensaver", "production", "reasoning"];
    for (const strategyId of strategyIds) {
      const res = await POST(
        makeRequest({
          userInput: "Test prompt for validation",
          aiModelId: "claude",
          domainId: "coding",
          strategyId,
        })
      );
      expect(res.status).toBe(200);
    }
  });
});
