/**
 * API route handler tests for /api/refine (Refine with AI).
 * Validates request validation, prompt refinement, fallback mechanisms, and response format.
 *
 * @jest-environment node
 */

const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/refine/route";

beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-api-key-for-jest";
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateContent.mockResolvedValue({
    text: JSON.stringify({
      enhancedPrompt: "ROLE:\nYou are a Principal Full-Stack Engineer.\n\nCONSTRAINTS:\n- Handle edge cases and network timeouts.",
      tips: [
        "Added explicit timeout boundaries",
        "Enforced strict error types",
        "Optimized for resilient execution",
      ],
    }),
  });
});

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/refine", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/refine", () => {
  describe("Validation", () => {
    it("returns 400 when currentPrompt is missing", async () => {
      const res = await POST(
        makeRequest({ refinementInstruction: "Make it more concise" })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Missing required field: currentPrompt/);
    });

    it("returns 400 when refinementInstruction is missing", async () => {
      const res = await POST(
        makeRequest({ currentPrompt: "You are an expert engineer" })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Missing required field: refinementInstruction/);
    });

    it("returns 400 when currentPrompt is too short", async () => {
      const res = await POST(
        makeRequest({ currentPrompt: "hi", refinementInstruction: "Make concise" })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Current prompt is too short/);
    });

    it("returns 400 when refinementInstruction is too short", async () => {
      const res = await POST(
        makeRequest({
          currentPrompt: "You are an expert engineer",
          refinementInstruction: "x",
        })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Refinement instruction is too short/);
    });

    it("returns 400 when currentPrompt exceeds 12000 characters", async () => {
      const res = await POST(
        makeRequest({
          currentPrompt: "a".repeat(12001),
          refinementInstruction: "Add edge cases",
        })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/12,000 character limit/);
    });

    it("returns 400 when refinementInstruction exceeds 1000 characters", async () => {
      const res = await POST(
        makeRequest({
          currentPrompt: "You are an expert engineer",
          refinementInstruction: "b".repeat(1001),
        })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/1,000 character limit/);
    });
  });

  describe("Refinement Execution & Structure", () => {
    it("returns 200 with structured RefinePromptResponse", async () => {
      const res = await POST(
        makeRequest({
          currentPrompt: "ROLE:\nYou are a developer.",
          refinementInstruction: "Add edge cases and strict schema",
          aiModelId: "chatgpt",
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(typeof json.enhancedPrompt).toBe("string");
      expect(Array.isArray(json.tips)).toBe(true);
      expect(json.tips.length).toBeGreaterThan(0);
      expect(typeof json.tokensBefore).toBe("number");
      expect(typeof json.tokensAfter).toBe("number");
      expect(json.metrics).toBeDefined();
      expect(typeof json.metrics.constraintsDetected).toBe("boolean");
    });

    it("strips heading hashes and asterisks from refined prompt", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          enhancedPrompt: "### ROLE:\nYou are an **expert** coder.\n* Write clean code.",
          tips: ["* Tip 1", "**Tip 2**"],
        }),
      });

      const res = await POST(
        makeRequest({
          currentPrompt: "ROLE:\nYou are a developer.",
          refinementInstruction: "Make more concise",
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.enhancedPrompt).not.toContain("###");
      expect(json.enhancedPrompt).not.toContain("**");
      expect(json.enhancedPrompt).not.toContain("*");
    });

    it("falls back to candidate models if first candidate fails", async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error("Primary model quota reached"))
        .mockResolvedValueOnce({
          text: JSON.stringify({
            enhancedPrompt: "ROLE:\nRefined prompt from fallback model.",
            tips: ["Handled gracefully"],
          }),
        });

      const res = await POST(
        makeRequest({
          currentPrompt: "ROLE:\nYou are a developer.",
          refinementInstruction: "Make beginner friendly",
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.enhancedPrompt).toContain("Refined prompt from fallback model");
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });
});
