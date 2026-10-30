/**
 * Integration & unit tests for Load Balancer engine (lib/loadBalancer.ts).
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

import {
  loadBalancedGenerate,
  getApiKeys,
  getNextApiKey,
  getPrioritizedModels,
  getHealthStats,
  getCacheStats,
  resetLoadBalancerState,
  estimateTokens,
  sanitizeInput,
  CANDIDATE_MODELS,
} from "@/lib/loadBalancer";

beforeEach(() => {
  jest.clearAllMocks();
  resetLoadBalancerState();
  process.env.GEMINI_API_KEY = "key-primary";
  delete process.env.GEMINI_API_KEYS;
});

describe("Load Balancer Integration", () => {
  describe("API Key Multi-Key Load Balancing", () => {
    it("returns single key when only GEMINI_API_KEY is configured", () => {
      process.env.GEMINI_API_KEY = "test-single-key";
      delete process.env.GEMINI_API_KEYS;

      expect(getApiKeys()).toEqual(["test-single-key"]);
      expect(getNextApiKey()).toBe("test-single-key");
    });

    it("parses and rotates across multiple comma-separated keys", () => {
      process.env.GEMINI_API_KEYS = "key-1, key-2, key-3";

      expect(getApiKeys()).toEqual(["key-1", "key-2", "key-3"]);

      const keyA = getNextApiKey();
      const keyB = getNextApiKey();
      const keyC = getNextApiKey();
      const keyD = getNextApiKey();

      expect(keyA).toBe("key-1");
      expect(keyB).toBe("key-2");
      expect(keyC).toBe("key-3");
      expect(keyD).toBe("key-1"); // wraps around in round-robin
    });

    it("throws clear error if neither GEMINI_API_KEY nor GEMINI_API_KEYS is defined", () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEYS;

      expect(() => getApiKeys()).toThrow(/GEMINI_API_KEY is not set/);
    });
  });

  describe("Model Prioritization & Health Scoring", () => {
    it("returns candidate models ordered by initial health", () => {
      const models = getPrioritizedModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(CANDIDATE_MODELS.length);
      expect(models).toContain("gemini-3.7-flash");
    });

    it("updates model health statistics on success", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '{"enhancedPrompt":"Success prompt","tips":[]}',
      });

      const result = await loadBalancedGenerate("Create a prompt for testing", {
        temperature: 0.7,
      });

      expect(result.text).toContain("Success prompt");
      expect(typeof result.latencyMs).toBe("number");

      const stats = getHealthStats();
      const usedModelStats = stats.find((s) => s.model === result.model);
      expect(usedModelStats).toBeDefined();
      expect(usedModelStats?.successCount).toBe(1);
      expect(usedModelStats?.consecutiveFailures).toBe(0);
    });

    it("fails over to next prioritized model when the first model fails", async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error("Resource exhausted (429)"))
        .mockResolvedValueOnce({
          text: '{"enhancedPrompt":"Fallback model result","tips":[]}',
        });

      const result = await loadBalancedGenerate("Prompt requiring failover");

      expect(result.text).toContain("Fallback model result");
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);

      const stats = getHealthStats();
      const failedModel = stats.find((s) => s.failCount > 0);
      expect(failedModel).toBeDefined();
      expect(failedModel?.consecutiveFailures).toBe(1);
    });
  });

  describe("In-Flight Request Deduplication", () => {
    it("coalesces concurrent requests with identical content and config", async () => {
      mockGenerateContent.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  text: '{"enhancedPrompt":"Coalesced response","tips":[]}',
                }),
              30
            )
          )
      );

      const [res1, res2] = await Promise.all([
        loadBalancedGenerate("Concurrent identical prompt", { temperature: 0.5 }),
        loadBalancedGenerate("Concurrent identical prompt", { temperature: 0.5 }),
      ]);

      expect(res1.text).toBe(res2.text);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe("Sanitization & Token Estimation", () => {
    it("sanitizes control characters correctly", () => {
      expect(sanitizeInput("  Hello\x00\x08 World!  ")).toBe("Hello World!");
      expect(sanitizeInput("Line 1\nLine 2\tIndented")).toBe("Line 1\nLine 2\tIndented");
    });

    it("calculates estimated tokens accurately", () => {
      expect(estimateTokens("")).toBe(1);
      expect(estimateTokens("test")).toBe(1);
      expect(estimateTokens("A longer sentence for estimating tokens")).toBe(10);
    });
  });
});
