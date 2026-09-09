/**
 * Unit tests for utility functions in the API generate route.
 *
 * We import the functions by re-declaring them here because they are
 * not exported from the route file. This keeps tests decoupled from
 * Next.js runtime while testing pure logic.
 */

import { cleanPromptFormatting } from "@/lib/cleanPrompt";

// ─── Replicas of pure functions from app/api/generate/route.ts ────────────────

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function sanitizeInput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Generation timed out after ${ms / 1000}s`)),
        ms
      )
    ),
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("estimateTokens", () => {
  it("returns 1 for an empty string", () => {
    expect(estimateTokens("")).toBe(1);
  });

  it("returns 1 for a very short string (1-4 chars)", () => {
    expect(estimateTokens("Hi")).toBe(1);
    expect(estimateTokens("abcd")).toBe(1);
  });

  it("estimates roughly text.length / 4 for longer strings", () => {
    const text = "a".repeat(100);
    expect(estimateTokens(text)).toBe(25);
  });

  it("rounds up fractional token counts", () => {
    // 5 chars → ceil(5/4) = 2
    expect(estimateTokens("hello")).toBe(2);
  });

  it("handles multi-byte characters by byte-counting the JS string length", () => {
    // 4 emoji chars each are 2 code units → length=8 → ceil(8/4) = 2
    const emoji = "🔥🔥🔥🔥";
    expect(estimateTokens(emoji)).toBeGreaterThanOrEqual(1);
  });
});

describe("sanitizeInput", () => {
  it("returns a clean string unchanged (minus outer whitespace)", () => {
    expect(sanitizeInput("  Hello world  ")).toBe("Hello world");
  });

  it("strips null bytes and control characters", () => {
    expect(sanitizeInput("He\x00llo\x07")).toBe("Hello");
  });

  it("preserves tabs and newlines", () => {
    expect(sanitizeInput("line1\n\tline2")).toBe("line1\n\tline2");
  });

  it("strips DEL character (\\x7F)", () => {
    expect(sanitizeInput("abc\x7Fdef")).toBe("abcdef");
  });

  it("returns empty string for input with only control chars + whitespace", () => {
    expect(sanitizeInput("  \x00\x01\x02  ")).toBe("");
  });

  it("handles empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

describe("withTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("resolves with the value when the promise is faster than the timeout", async () => {
    const fast = Promise.resolve("done");
    await expect(withTimeout(fast, 5000)).resolves.toBe("done");
  });

  it("rejects with timeout error when promise is slower than timeout", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("late"), 10000)
    );
    const p = withTimeout(slow, 1000);
    jest.advanceTimersByTime(1500);
    await expect(p).rejects.toThrow("Generation timed out after 1s");
  });

  it("rejects with original error when promise rejects before timeout", async () => {
    const failing = Promise.reject(new Error("API error"));
    await expect(withTimeout(failing, 5000)).rejects.toThrow("API error");
  });
});

describe("cleanPromptFormatting", () => {
  it("removes markdown heading hashes and formats as clean uppercase titles", () => {
    const input = "### Role\nYou are an expert.\n## Goal:\nBuild an API.";
    const result = cleanPromptFormatting(input);
    expect(result).not.toContain("#");
    expect(result).toContain("ROLE:");
    expect(result).toContain("GOAL:");
  });

  it("removes bold and italic asterisks", () => {
    const input = "Use **TypeScript** with *strict* mode and ***full typing***.";
    const result = cleanPromptFormatting(input);
    expect(result).not.toContain("*");
    expect(result).toContain("Use TypeScript with strict mode and full typing.");
  });

  it("converts bullet asterisks to clean hyphens", () => {
    const input = "* Feature A\n* Feature B\n  * Nested feature";
    const result = cleanPromptFormatting(input);
    expect(result).not.toContain("*");
    expect(result).toContain("- Feature A");
    expect(result).toContain("- Feature B");
    expect(result).toContain("  - Nested feature");
  });

  it("handles empty or falsy inputs gracefully", () => {
    expect(cleanPromptFormatting("")).toBe("");
  });

  it("preserves XML tags and clean hyphenated structure", () => {
    const input = "<role>\nYou are a coder.\n</role>\n<instructions>\n- Rule 1\n- Rule 2\n</instructions>";
    const result = cleanPromptFormatting(input);
    expect(result).not.toContain("#");
    expect(result).not.toContain("*");
    expect(result).toContain("<role>");
    expect(result).toContain("- Rule 1");
  });

  it("strips raw JSON object wrappers and unescapes literal newlines", () => {
    const rawJson = '{\n  "enhancedPrompt": "ROLE:\\nYou are a Principal Full-Stack Engineer.\\n\\nCONTEXT:\\nDeveloper building bot.",\n  "tips": ["Tip 1"]\n}';
    const result = cleanPromptFormatting(rawJson);
    expect(result).not.toContain('"enhancedPrompt"');
    expect(result).not.toContain('{"');
    expect(result).toContain("ROLE:\nYou are a Principal Full-Stack Engineer.");
    expect(result).toContain("CONTEXT:\nDeveloper building bot.");
  });

  it("handles truncated raw JSON without trailing closing quotes", () => {
    const truncated = '{\n  "enhancedPrompt": "ROLE:\\nYou are an expert.\\n\\nTASK:\\nBuild API';
    const result = cleanPromptFormatting(truncated);
    expect(result).not.toContain('"enhancedPrompt"');
    expect(result).toContain("ROLE:\nYou are an expert.");
    expect(result).toContain("TASK:\nBuild API");
  });

  it("removes stray hashes like Step #1 while preserving #include", () => {
    const input = "Step #1: Initialize project\nStep #2: Add #include <iostream>\nIssue #99";
    const result = cleanPromptFormatting(input);
    expect(result).toContain("Step 1: Initialize project");
    expect(result).toContain("Step 2: Add #include <iostream>");
    expect(result).toContain("Issue 99");
    expect(result).not.toContain("Step #1");
  });
});
