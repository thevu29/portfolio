import { describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import { FALLBACK_HEX, normalizeTechName, resolveTech, stackSkills } from "@/lib/tech";

describe("normalizeTechName", () => {
  it("ignores case, extra spaces and parenthetical notes", () => {
    expect(normalizeTechName("  GitHub   Actions (CI/CD) ")).toBe("github actions");
    expect(normalizeTechName("Next.js")).toBe("next.js");
  });
});

describe("resolveTech", () => {
  it("returns a brand icon for known technologies", () => {
    const react = resolveTech("React");
    expect(react.title).toBe("React");
    expect(react.path).toMatch(/^M/);
    expect(react.hex).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("maps aliases to the right icon", () => {
    expect(resolveTech("Java").path).toBe(resolveTech("OpenJDK").path);
    expect(resolveTech("TailwindCSS").path).toBe(resolveTech("Tailwind CSS").path);
    expect(resolveTech("GitHub Actions (CI/CD)").path).toBeDefined();
  });

  it("falls back to a monogram (no path, neutral colour) for unknown names", () => {
    const unknown = resolveTech("Some Internal Tool");
    expect(unknown.path).toBeUndefined();
    expect(unknown.hex).toBe(FALLBACK_HEX);
    expect(unknown.title).toBe("Some Internal Tool");
  });

  it("only falls back for the known icon-less names in the CV", () => {
    const names = [...cv.projects.flatMap((p) => p.stack), ...cv.skills.flatMap((g) => g.items)];
    const fallbacks = [...new Set(names.filter((n) => !resolveTech(n).path))].sort();
    // Update this list deliberately when adding a tech without a simple-icons logo.
    expect(fallbacks).toEqual(
      [
        "AWS",
        "AWS S3",
        "BullMQ",
        "CQRS",
        "E2E Testing",
        "English (TOEIC 815)",
        "Integration Testing",
        "Microservices",
        "RESTful APIs",
        "SQL",
        "Unit Testing",
        "Zustand",
      ].sort(),
    );
  });
});

describe("stackSkills", () => {
  it("lists tools (not practices or spoken languages) without duplicates", () => {
    const skills = stackSkills(cv);
    const titles = skills.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).toContain("React");
    expect(titles).toContain("Docker");
    expect(titles).not.toContain("CQRS");
    expect(titles).not.toContain("English (TOEIC 815)");
  });
});
