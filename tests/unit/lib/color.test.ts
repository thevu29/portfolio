import { describe, expect, it } from "vitest";
import { isLightColor, readableTextOn, relativeLuminance } from "@/lib/color";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBe(1);
  });

  it("accepts hex with or without # and in any case", () => {
    expect(relativeLuminance("FFFFFF")).toBe(1);
    expect(relativeLuminance("#fFfFfF")).toBe(1);
  });

  it("supports 3-digit shorthand", () => {
    expect(relativeLuminance("#fff")).toBe(1);
  });

  it("throws on malformed input", () => {
    expect(() => relativeLuminance("#12")).toThrow(/Invalid hex/);
    expect(() => relativeLuminance("zzzzzz")).toThrow(/Invalid hex/);
  });
});

describe("readableTextOn", () => {
  it("uses black on light brand colours", () => {
    expect(readableTextOn("#F7DF1E")).toBe("#000000"); // JavaScript yellow
    expect(readableTextOn("#ffffff")).toBe("#000000");
  });

  it("uses white on dark brand colours", () => {
    expect(readableTextOn("#000000")).toBe("#ffffff");
    expect(readableTextOn("#3178C6")).toBe("#ffffff"); // TypeScript blue
    expect(readableTextOn("#E0234E")).toBe("#ffffff"); // NestJS red
  });

  it("keeps white exactly while it still meets AA (4.5:1)", () => {
    expect(readableTextOn("#757575")).toBe("#ffffff"); // white 4.61
    expect(readableTextOn("#777777")).toBe("#000000"); // white 4.48 < AA
  });
});

describe("isLightColor", () => {
  it("flags colours too light to show on white", () => {
    expect(isLightColor("#F7DF1E")).toBe(true);
    expect(isLightColor("#000000")).toBe(false);
  });
});
