/**
 * API route handler tests for /api/test-prompt (Live Sandbox).
 * Validates request validation, fallback mechanism, and comparative responses.
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
import { POST } from "@/app/api/test-prompt/route";

beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-api-key-for-jest";
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateContent.mockResolvedValue({
    text: "Simulated AI completion response for the test prompt.",
  });
});

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/test-prompt", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/test-prompt", () => {
  describe("Validation", () => {
    it("returns 400 when prompt is missing", async () => {
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Missing required field: prompt/);
    });

    it("returns 400 when prompt is empty or just whitespace", async () => {
      const res = await POST(makeRequest({ prompt: "   " }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/too short/);
    });

    it("returns 400 when prompt is shorter than 3 characters", async () => {
      const res = await POST(makeRequest({ prompt: "hi" }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/at least 3 characters/);
    });

    it("returns 400 when prompt exceeds 6000 characters", async () => {
      const res = await POST(makeRequest({ prompt: "a".repeat(6001) }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/6,000 character testing limit/);
    });
  });

  describe("Execution & Response", () => {
    it("returns 200 with generated response, token count, and execution time", async () => {
      const res = await POST(
        makeRequest({
          prompt: "Act as an expert software architect and explain microservices.",
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.response).toBe("Simulated AI completion response for the test prompt.");
      expect(typeof json.executionTimeMs).toBe("number");
      expect(json.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof json.tokensUsed).toBe("number");
      expect(json.tokensUsed).toBeGreaterThan(0);
      expect(json.originalResponse).toBeUndefined();
    });

    it("executes comparative run when compareOriginal is true", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({ text: "Engineered response" })
        .mockResolvedValueOnce({ text: "Original casual response" });

      const res = await POST(
        makeRequest({
          prompt: "High precision engineered prompt with constraints and roles",
          originalInput: "Explain microservices simply",
          compareOriginal: true,
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.response).toBe("Engineered response");
      expect(json.originalResponse).toBe("Original casual response");
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it("falls back to candidate models if first model throws error", async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error("Model rate limit exceeded"))
        .mockResolvedValueOnce({ text: "Fallback model succeeded" });

      const res = await POST(
        makeRequest({
          prompt: "Test resilient model fallback",
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.response).toBe("Fallback model succeeded");
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });
});
