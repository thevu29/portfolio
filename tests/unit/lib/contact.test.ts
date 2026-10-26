import { describe, expect, it } from "vitest";
import { parseContact } from "@/lib/contact";

const valid = {
  CONTACT_EMAIL: "me@example.com",
  GITHUB_URL: "https://github.com/someone",
  LINKEDIN_URL: "https://www.linkedin.com/in/someone",
};

describe("parseContact", () => {
  it("reads email, GitHub and LinkedIn from the environment", () => {
    expect(parseContact(valid)).toEqual({
      email: "me@example.com",
      github: "https://github.com/someone",
      linkedin: "https://www.linkedin.com/in/someone",
    });
  });

  it("trims whitespace and a trailing slash", () => {
    expect(
      parseContact({
        CONTACT_EMAIL: "  me@example.com ",
        GITHUB_URL: "https://github.com/someone/",
        LINKEDIN_URL: " https://linkedin.com/in/someone/ ",
      }),
    ).toEqual({
      email: "me@example.com",
      github: "https://github.com/someone",
      linkedin: "https://linkedin.com/in/someone",
    });
  });

  it.each(["CONTACT_EMAIL", "GITHUB_URL", "LINKEDIN_URL"])(
    "fails fast when %s is missing",
    (name) => {
      expect(() => parseContact({ ...valid, [name]: undefined })).toThrow(
        `${name} is not set (see .env.example)`,
      );
      expect(() => parseContact({ ...valid, [name]: "   " })).toThrow(`${name} is not set`);
    },
  );

  it.each(["me", "me@", "me@example", "me @example.com", "mailto:me@example.com"])(
    "rejects malformed email %j",
    (email) => {
      expect(() => parseContact({ ...valid, CONTACT_EMAIL: email })).toThrow(
        "CONTACT_EMAIL is not a valid email",
      );
    },
  );

  it("rejects a value that is not a URL", () => {
    expect(() => parseContact({ ...valid, GITHUB_URL: "github.com/someone" })).toThrow(
      'GITHUB_URL is not a valid URL: "github.com/someone"',
    );
  });

  it.each([
    ["GITHUB_URL", "http://github.com/someone"],
    ["GITHUB_URL", "https://gitlab.com/someone"],
    ["GITHUB_URL", "https://github.com.evil.com/someone"],
    ["GITHUB_URL", "https://github.com"],
    ["LINKEDIN_URL", "https://example.com/in/someone"],
    ["LINKEDIN_URL", "javascript:alert(1)"],
  ])("rejects %s=%s (must be an https profile URL on the right site)", (name, value) => {
    expect(() => parseContact({ ...valid, [name]: value })).toThrow(`${name} must be`);
  });
});
