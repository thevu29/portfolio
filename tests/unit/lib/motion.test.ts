import { describe, expect, it } from "vitest";
import { REVEAL_MAX_STAGGER_STEPS, REVEAL_STAGGER_MS, revealDelay } from "@/lib/motion";

describe("revealDelay", () => {
  it("does not delay the first block of a batch", () => {
    expect(revealDelay(0)).toBe(0);
  });

  it("adds one stagger step per block", () => {
    expect(revealDelay(1)).toBe(REVEAL_STAGGER_MS);
    expect(revealDelay(3)).toBe(3 * REVEAL_STAGGER_MS);
  });

  it("caps the delay at the last stagger step", () => {
    const cap = REVEAL_MAX_STAGGER_STEPS * REVEAL_STAGGER_MS;
    expect(revealDelay(REVEAL_MAX_STAGGER_STEPS)).toBe(cap);
    expect(revealDelay(REVEAL_MAX_STAGGER_STEPS + 1)).toBe(cap);
    expect(revealDelay(50)).toBe(cap);
  });

  it("treats a negative index as the first block", () => {
    expect(revealDelay(-2)).toBe(0);
  });
});
