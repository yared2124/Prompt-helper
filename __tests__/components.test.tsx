/**
 * Component rendering tests — verify each component renders without
 * crashing and contains expected UI elements.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Header ────────────────────────────────────────────────────────────────────

// Mock localStorage for ThemeToggle child
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      },
    },
    writable: true,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

import Header from "@/components/Header";
import IconRenderer from "@/components/IconRenderer";
import ThemeToggle from "@/components/ThemeToggle";

describe("Header", () => {
  it("renders the brand name", () => {
    render(<Header savedCount={0} onOpenLibrary={jest.fn()} />);
    expect(screen.getByText("promptHelper")).toBeInTheDocument();
  });

  it("renders the subtitle with author attribution", () => {
    render(<Header savedCount={0} onOpenLibrary={jest.fn()} />);
    expect(screen.getByText(/AI-Native Prompt Architect built by/i)).toBeInTheDocument();
    expect(screen.getByText("@Techyada21")).toBeInTheDocument();
  });

  it("links @Techyada21 to Telegram channel", () => {
    render(<Header savedCount={0} onOpenLibrary={jest.fn()} />);
    const link = screen.getByRole("link", { name: "@Techyada21" });
    expect(link).toHaveAttribute("href", "https://t.me/Techyada21");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows badge count when savedCount > 0", () => {
    render(<Header savedCount={5} onOpenLibrary={jest.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when savedCount exceeds 99", () => {
    render(<Header savedCount={150} onOpenLibrary={jest.fn()} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("hides badge when savedCount is 0", () => {
    render(<Header savedCount={0} onOpenLibrary={jest.fn()} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders GitHub link with correct href", () => {
    render(<Header savedCount={0} onOpenLibrary={jest.fn()} />);
    const ghLink = screen.getByTitle("View on GitHub");
    expect(ghLink).toHaveAttribute(
      "href",
      "https://github.com/yared2124/Prompt-helper"
    );
    expect(ghLink).toHaveAttribute("target", "_blank");
  });

  it("calls onOpenLibrary when library button is clicked", () => {
    const onOpen = jest.fn();
    render(<Header savedCount={0} onOpenLibrary={onOpen} />);
    screen.getByTitle("Open Saved Prompts Library").click();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

// ── IconRenderer ──────────────────────────────────────────────────────────────

describe("IconRenderer", () => {
  it("renders a known icon without crashing", () => {
    const { container } = render(<IconRenderer name="Code2" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to Sparkles for an unknown icon name", () => {
    const { container } = render(<IconRenderer name="NonExistentIcon" />);
    // Still renders an SVG (the fallback Sparkles)
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("passes size and className props through", () => {
    const { container } = render(
      <IconRenderer name="Zap" size={24} className="text-red-500" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });
});

// ── ThemeToggle ───────────────────────────────────────────────────────────────

describe("ThemeToggle", () => {
  it("renders without crashing", () => {
    const { container } = render(<ThemeToggle />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders a button with accessible aria-label after mount", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label");
  });
});
