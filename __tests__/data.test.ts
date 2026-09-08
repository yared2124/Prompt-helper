/**
 * Data integrity tests — ensure AI_MODELS, DOMAINS, and PROMPT_STRATEGIES
 * have consistent shapes and no missing required fields.
 */
import { AI_MODELS, PROMPT_STRATEGIES } from "@/data/aiModels";
import { DOMAINS } from "@/data/domains";

describe("AI_MODELS data integrity", () => {
  it("has at least 1 model", () => {
    expect(AI_MODELS.length).toBeGreaterThan(0);
  });

  it("every model has unique id", () => {
    const ids = AI_MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(
    AI_MODELS.map((m) => [m.id, m])
  )("model '%s' has all required fields", (_id, model) => {
    const m = model as typeof AI_MODELS[0];
    expect(m.id).toBeTruthy();
    expect(m.name).toBeTruthy();
    expect(m.provider).toBeTruthy();
    expect(m.iconName).toBeTruthy();
    expect(m.color).toBeTruthy();
    expect(m.borderColor).toBeTruthy();
    expect(m.bgGlow).toBeTruthy();
    expect(m.description).toBeTruthy();
    expect(["frontier", "reasoning", "opensource", "specialized"]).toContain(
      m.category
    );
    expect(m.strengths.length).toBeGreaterThanOrEqual(1);
    expect(m.models.length).toBeGreaterThanOrEqual(1);
    expect(m.selectedModel).toBeTruthy();
    expect(m.webUrl).toMatch(/^https?:\/\//);
  });

  it("every model's selectedModel is in its models array", () => {
    AI_MODELS.forEach((m) => {
      expect(m.models).toContain(m.selectedModel);
    });
  });
});

describe("DOMAINS data integrity", () => {
  it("has at least 1 domain", () => {
    expect(DOMAINS.length).toBeGreaterThan(0);
  });

  it("every domain has unique id", () => {
    const ids = DOMAINS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(
    DOMAINS.map((d) => [d.id, d])
  )("domain '%s' has all required fields", (_id, domain) => {
    const d = domain as typeof DOMAINS[0];
    expect(d.id).toBeTruthy();
    expect(d.name).toBeTruthy();
    expect(d.iconName).toBeTruthy();
    expect(d.description).toBeTruthy();
    expect(d.color).toBeTruthy();
    expect(d.examples.length).toBeGreaterThanOrEqual(1);
  });
});

describe("PROMPT_STRATEGIES data integrity", () => {
  it("has at least 1 strategy", () => {
    expect(PROMPT_STRATEGIES.length).toBeGreaterThan(0);
  });

  it("every strategy has unique id", () => {
    const ids = PROMPT_STRATEGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("first strategy is the default (balanced)", () => {
    expect(PROMPT_STRATEGIES[0].id).toBe("balanced");
  });

  it.each(
    PROMPT_STRATEGIES.map((s) => [s.id, s])
  )("strategy '%s' has all required fields", (_id, strategy) => {
    const s = strategy as typeof PROMPT_STRATEGIES[0];
    expect(s.id).toBeTruthy();
    expect(s.name).toBeTruthy();
    expect(s.iconName).toBeTruthy();
    expect(s.description).toBeTruthy();
    expect(s.benefit).toBeTruthy();
  });
});
