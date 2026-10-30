import "@testing-library/jest-dom";

process.env.GEMINI_MODEL = "gemini-3.8-flash";
process.env.GEMINI_FALLBACK_MODEL = "gemini-3.7-flash";
process.env.GEMINI_API_KEY = "test-gemini-api-key-for-tests";

// Global polyfills for jsdom
if (typeof window !== "undefined") {
  // localStorage polyfill
  const storage: Record<string, string> = {};
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = String(val);
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const k in storage) delete storage[k];
      },
      get length() {
        return Object.keys(storage).length;
      },
      key: (i: number) => Object.keys(storage)[i] ?? null,
    },
    writable: true,
  });

  // matchMedia polyfill
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });

  // scrollIntoView polyfill
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  }
}
