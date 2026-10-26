import { describe, expect, it } from "vitest";
import { parseSiteUrl, resolveMetadataBase } from "@/lib/site";

describe("parseSiteUrl", () => {
  it("returns undefined when unset or blank", () => {
    expect(parseSiteUrl(undefined)).toBeUndefined();
    expect(parseSiteUrl("")).toBeUndefined();
    expect(parseSiteUrl("   ")).toBeUndefined();
  });

  it("normalises to the origin (drops path and trailing slash)", () => {
    expect(parseSiteUrl("https://thevu.dev/")).toBe("https://thevu.dev");
    expect(parseSiteUrl(" https://thevu.dev/cv ")).toBe("https://thevu.dev");
  });

  it("throws on malformed URLs", () => {
    expect(() => parseSiteUrl("thevu.dev")).toThrow(/not a valid URL/);
  });

  it("rejects non-http protocols", () => {
    expect(() => parseSiteUrl("ftp://thevu.dev")).toThrow(/must use http/);
  });
});

describe("resolveMetadataBase", () => {
  it("prefers the explicit site URL", () => {
    expect(resolveMetadataBase("https://thevu.dev", "x.vercel.app")).toBe("https://thevu.dev");
  });

  it("falls back to the Vercel production host over https", () => {
    expect(resolveMetadataBase(undefined, "portfolio.vercel.app")).toBe(
      "https://portfolio.vercel.app",
    );
  });

  it("uses localhost only when neither is available", () => {
    expect(resolveMetadataBase(undefined, undefined)).toBe("http://localhost:3000");
    expect(resolveMetadataBase(undefined, "")).toBe("http://localhost:3000");
  });
});
