import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME,
  isTheme,
  readStoredTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  toggleTheme,
} from "@/lib/theme";

describe("toggleTheme", () => {
  it("switches between light and dark only", () => {
    expect(toggleTheme("light")).toBe("dark");
    expect(toggleTheme("dark")).toBe("light");
  });
});

describe("isTheme", () => {
  it("accepts only light and dark", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
});

describe("readStoredTheme", () => {
  it("defaults to dark", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(readStoredTheme(null)).toBe("dark");
  });

  it("keeps a stored light or dark choice", () => {
    expect(readStoredTheme("light")).toBe("light");
    expect(readStoredTheme("dark")).toBe("dark");
  });

  it("maps the old 'system' value and garbage to the default", () => {
    expect(readStoredTheme("system")).toBe("dark");
    expect(readStoredTheme("blue")).toBe("dark");
    expect(readStoredTheme("")).toBe("dark");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  const run = () => new Function(THEME_INIT_SCRIPT)();

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  // The inline script must agree with readStoredTheme() for every input,
  // whatever the OS prefers (the OS setting is ignored).
  for (const value of [null, "light", "dark", "system", "blue"] as const) {
    for (const osDark of [false, true]) {
      it(`stored=${value} os=${osDark ? "dark" : "light"} matches readStoredTheme`, () => {
        vi.stubGlobal("matchMedia", (query: string) => ({ matches: osDark, media: query }));
        if (value !== null) localStorage.setItem(THEME_STORAGE_KEY, value);
        run();
        expect(document.documentElement.dataset.theme).toBe(readStoredTheme(value));
      });
    }
  }

  it("does not throw and stays dark when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(run).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
