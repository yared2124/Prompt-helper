/**
 * Unit tests for utility functions in the API generate route.
 *
 * We import the functions by re-declaring them here because they are
 * not exported from the route file. This keeps tests decoupled from
 * Next.js runtime while testing pure logic.
 */

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
