import { describe, expect, it } from "vitest";
import { cv, formatPeriod, PRESENT, type Period } from "@/content/cv";

const MONTH_YEAR = /^(0[1-9]|1[0-2])\/\d{4}$/;
const YEAR = /^\d{4}$/;

function allPeriods(): Period[] {
  return [
    ...cv.experience.flatMap((e) => e.roles.map((r) => r.period)),
    ...cv.projects.map((p) => p.period),
  ];
}

describe("cv content", () => {
  it("has a complete profile", () => {
    const { profile } = cv;
    expect(profile.name).toBe("Nguyen The Vu");
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(profile.linkedin).toMatch(/^https:\/\//);
    expect(profile.github).toMatch(/^https:\/\//);
    expect(profile.phone).not.toHaveLength(0);
  });

  it("uses MM/YYYY dates (or 'present' as the end) for roles and projects", () => {
    for (const { start, end } of allPeriods()) {
      expect(start).toMatch(MONTH_YEAR);
      if (end !== PRESENT) expect(end).toMatch(MONTH_YEAR);
    }
  });

  it("uses YYYY dates for education", () => {
    for (const { period } of cv.education) {
      expect(period.start).toMatch(YEAR);
      expect(period.end).toMatch(YEAR);
    }
  });

  it("never has an end date before its start date", () => {
    const toMonths = (value: string) => {
      const [m, y] = value.split("/").map(Number);
      return y * 12 + m;
    };
    for (const { start, end } of allPeriods()) {
      if (end === PRESENT) continue;
      expect(toMonths(end)).toBeGreaterThanOrEqual(toMonths(start));
    }
  });

  it("has no empty bullets, descriptions or stack entries", () => {
    const strings = [
      cv.summary,
      ...cv.experience.flatMap((e) => e.roles.flatMap((r) => r.bullets)),
      ...cv.projects.flatMap((p) => [p.description, ...p.bullets, ...p.stack]),
      ...cv.skills.flatMap((g) => [g.label, ...g.items]),
    ];
    for (const s of strings) expect(s.trim()).not.toBe("");
  });

  it("keeps the Canva section and project order", () => {
    expect(cv.skills.map((g) => g.label)).toEqual([
      "Programming Languages",
      "Frontend",
      "Backend",
      "Databases & Caching",
      "Architecture & Practices",
      "Tools & DevOps",
      "Languages",
    ]);
    expect(cv.projects.map((p) => p.slug)).toEqual(["ecommerce", "insurance-real-estate", "wms", "dating-app"]);
    expect(cv.experience[0].roles.map((r) => r.title)).toEqual([
      "Software Engineer",
      "Software Engineer Intern",
    ]);
  });

  it("has unique project slugs", () => {
    const slugs = cv.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("formatPeriod", () => {
  it("joins start and end with a spaced hyphen", () => {
    expect(formatPeriod({ start: "09/2025", end: PRESENT })).toBe("09/2025 - present");
    expect(formatPeriod({ start: "2021", end: "2025" })).toBe("2021 - 2025");
  });
});
