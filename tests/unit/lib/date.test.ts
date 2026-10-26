import { describe, expect, it } from "vitest";
import { formatDuration, formatMonth, monthIndex, monthsBetween } from "@/lib/date";

describe("formatMonth", () => {
  it("turns MM/YYYY into a short LinkedIn-style month", () => {
    expect(formatMonth("09/2025")).toBe("Sep 2025");
    expect(formatMonth("01/2026")).toBe("Jan 2026");
    expect(formatMonth("12/2025")).toBe("Dec 2025");
  });

  it("maps 'present' to Present and passes bare years through", () => {
    expect(formatMonth("present")).toBe("Present");
    expect(formatMonth("2021")).toBe("2021");
  });

  it("throws on malformed months", () => {
    expect(() => formatMonth("13/2025")).toThrow(/Invalid month/);
    expect(() => formatMonth("9-2025")).toThrow(/Invalid month/);
  });
});

describe("monthIndex", () => {
  it("is monotonically increasing across year boundaries", () => {
    expect(monthIndex("01/2026") - monthIndex("12/2025")).toBe(1);
  });
});

describe("monthsBetween", () => {
  it("counts both the start and end month (LinkedIn convention)", () => {
    expect(monthsBetween("03/2025", "08/2025")).toBe(6);
    expect(monthsBetween("09/2025", "09/2025")).toBe(1);
  });

  it("uses the given current month for 'present'", () => {
    expect(monthsBetween("09/2025", "present", monthIndex("10/2026"))).toBe(14);
  });

  it("throws when 'present' has no reference month", () => {
    expect(() => monthsBetween("09/2025", "present")).toThrow(/current month/);
  });
});

describe("formatDuration", () => {
  it("formats months and years with singular/plural", () => {
    expect(formatDuration(1)).toBe("1 mo");
    expect(formatDuration(6)).toBe("6 mos");
    expect(formatDuration(12)).toBe("1 yr");
    expect(formatDuration(14)).toBe("1 yr 2 mos");
    expect(formatDuration(25)).toBe("2 yrs 1 mo");
  });

  it("rejects non-positive durations", () => {
    expect(() => formatDuration(0)).toThrow();
  });
});
