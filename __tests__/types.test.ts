/**
 * Type-level tests — ensure the TypeScript interfaces are structurally correct
 * by constructing valid objects and verifying required vs optional fields.
 */
import type {
  AIModel,
  Domain,
  PromptStrategy,
  PromptMetrics,
  GeneratedPrompt,
  GenerateRequest,
  GenerateResponse,
} from "@/types";

describe("TypeScript interfaces - structural checks", () => {
  it("AIModel interface accepts a valid object", () => {
    const model: AIModel = {
      id: "test",
      name: "Test Model",
      provider: "TestCo",
      iconName: "Flame",
      color: "text-blue-500",
      borderColor: "border-blue-500/40",
      bgGlow: "shadow-blue-500/15",
      description: "A test model",
      category: "frontier",
      strengths: ["Fast", "Accurate"],
      models: ["test-v1", "test-v2"],
      selectedModel: "test-v1",
      webUrl: "https://test.com",
    };
    expect(model.id).toBe("test");
    expect(model.category).toBe("frontier");
  });

  it("Domain interface accepts a valid object", () => {
    const domain: Domain = {
      id: "test-domain",
      name: "Test Domain",
      iconName: "Code2",
      description: "A test domain",
      color: "from-blue-500/20",
      examples: ["Example 1"],
    };
    expect(domain.examples).toHaveLength(1);
  });

  it("PromptStrategy interface accepts a valid object", () => {
    const strategy: PromptStrategy = {
      id: "test-strategy",
      name: "Test Strategy",
      iconName: "Zap",
      description: "A test strategy",
      benefit: "Some benefit",
    };
    expect(strategy.benefit).toBeTruthy();
  });

  it("GenerateRequest allows optional strategyId and targetModel", () => {
    const minimal: GenerateRequest = {
      userInput: "hello",
      aiModelId: "claude",
      domainId: "coding",
    };
    expect(minimal.strategyId).toBeUndefined();
    expect(minimal.targetModel).toBeUndefined();

    const full: GenerateRequest = {
      userInput: "hello",
      aiModelId: "claude",
      domainId: "coding",
      strategyId: "balanced",
      targetModel: "claude-3-7-sonnet",
    };
    expect(full.strategyId).toBe("balanced");
  });

  it("GenerateResponse allows optional metrics", () => {
    const res: GenerateResponse = {
      enhancedPrompt: "prompt",
      tips: ["tip"],
      tokensBefore: 5,
      tokensAfter: 25,
    };
    expect(res.metrics).toBeUndefined();
  });

  it("PromptMetrics has correct shape", () => {
    const metrics: PromptMetrics = {
      roleDetected: true,
      constraintsDetected: false,
      outputFormatDetected: true,
      savingsPercentage: 42,
    };
    expect(metrics.savingsPercentage).toBe(42);
  });

  it("GeneratedPrompt has required id and savedAt", () => {
    const prompt: GeneratedPrompt = {
      id: "prompt_123",
      originalInput: "test",
      enhancedPrompt: "enhanced test",
      aiModel: "Claude",
      aiProvider: "Anthropic",
      domain: "Coding",
      tokensBefore: 2,
      tokensAfter: 10,
      savedAt: new Date().toISOString(),
      tips: ["tip1"],
    };
    expect(prompt.id).toMatch(/^prompt_/);
    expect(prompt.savedAt).toBeTruthy();
    // Optional fields
    expect(prompt.strategy).toBeUndefined();
    expect(prompt.metrics).toBeUndefined();
  });
});
