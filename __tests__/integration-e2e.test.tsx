/**
 * End-to-End User Flow Integration Tests.
 *
 * Validates the full browser interaction flow:
 * 1. Preset selection and prompt goal composition
 * 2. Generating optimized prompts via /api/generate
 * 3. Inspecting token metrics and structural tips in Analysis tab
 * 4. Saving prompt to local storage library and verifying header count
 * 5. Opening the Library drawer and interacting with saved prompts
 * 6. Resilient handling of API errors and edge cases
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

const mockSuccessResponse = {
  enhancedPrompt: `ROLE:
You are a Principal Software Engineer and System Architect.

TASK:
Design and implement a thread-safe Binary Search Tree in Python 3.10.

CONSTRAINTS:
- Use strict type annotations with typing module
- Implement insert, search, delete, and inorder traversal
- Big-O time and space complexity docstrings for each method
- Include comprehensive unit tests using pytest

OUTPUT FORMAT:
Provide production-ready Python code with zero markdown hashes or asterisks.`,
  tips: [
    "Demarcate role definitions from task instructions",
    "Specify precise language version and type requirements",
    "Request test fixtures for automated validation",
  ],
  tokensBefore: 28,
  tokensAfter: 94,
  metrics: {
    roleDetected: true,
    constraintsDetected: true,
    outputFormatDetected: true,
    savingsPercentage: 235,
  },
};

describe("End-to-End Integration Flow (Home Page)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("renders page title and hero elements", () => {
    render(<Home />);

    expect(screen.getByText(/Architect prompts/i)).toBeInTheDocument();
    expect(screen.getByText(/under/i)).toBeInTheDocument();
    expect(screen.getByText(/real constraints/i)).toBeInTheDocument();
  });

  it("loads a showcase preset into the input goal when clicked", async () => {
    const { container } = render(<Home />);

    const presetBtn = screen.getByRole("button", {
      name: /Python Binary Search Tree/i,
    });
    expect(presetBtn).toBeInTheDocument();

    fireEvent.click(presetBtn);

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain("Binary Search Tree in Python 3.10");
  });

  it("executes the full prompt engineering flow from input to output and save", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
      headers: new Headers({
        "X-Response-Time": "210ms",
        "X-Model-Used": "gemini-3.7-flash",
      }),
    });

    render(<Home />);

    // 1. Select preset to populate prompt
    const presetBtn = screen.getByRole("button", {
      name: /Python Binary Search Tree/i,
    });
    fireEvent.click(presetBtn);

    // 2. Click the generate button
    const generateBtn = screen.getByRole("button", {
      name: /Generate Optimized Prompt/i,
    });
    expect(generateBtn).not.toBeDisabled();
    fireEvent.click(generateBtn);

    // 3. Verify fetch call payload
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/generate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Binary Search Tree in Python 3.10"),
      })
    );

    // 4. Verify output renders
    await waitFor(() => {
      expect(
        screen.getByText(/Principal Software Engineer and System Architect/i)
      ).toBeInTheDocument();
    });

    // Check token economy metrics
    expect(screen.getByText(/~28 tokens/i)).toBeInTheDocument();
    expect(screen.getByText(/~94 tokens/i)).toBeInTheDocument();

    // Check Analysis & Tips tab
    const analysisTab = screen.getByRole("button", { name: /Analysis & Tips/i });
    fireEvent.click(analysisTab);

    expect(
      screen.getByText(/Demarcate role definitions from task instructions/i)
    ).toBeInTheDocument();

    // Switch back to Prompt tab to save
    const promptTab = screen.getByRole("button", { name: /^Prompt$/i });
    fireEvent.click(promptTab);

    // 5. Save prompt to Library
    const saveBtn = screen.getByRole("button", {
      name: /Save prompt to library/i,
    });
    fireEvent.click(saveBtn);

    // Toast notification check
    await waitFor(() => {
      expect(
        screen.getByText(/Saved to your local browser library!/i)
      ).toBeInTheDocument();
    });

    // Header badge updates to 1
    const libraryBtn = screen.getByTitle("Open Saved Prompts Library");
    expect(within(libraryBtn).getByText("1")).toBeInTheDocument();

    // 6. Open Library drawer and verify saved prompt
    fireEvent.click(libraryBtn);

    expect(screen.getByText("Prompt Library")).toBeInTheDocument();
    const promptElements = screen.getAllByText(
      /Implement a production-grade Binary Search Tree/i
    );
    expect(promptElements.length).toBeGreaterThanOrEqual(2);
  });

  it("handles generation errors gracefully with alert banner", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "API rate limit reached. Please wait a few seconds and try again.",
      }),
    });

    const { container } = render(<Home />);

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    fireEvent.change(textarea, {
      target: { value: "Build a microservice in Go" },
    });

    const generateBtn = screen.getByRole("button", {
      name: /Generate Optimized Prompt/i,
    });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Generation Encountered an Issue:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/API rate limit reached/i)
      ).toBeInTheDocument();
    });
  });
});
