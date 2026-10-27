// Plain module (not "use client") so server components can read real values.
/** Delay between sequenced items, in seconds. */
export const STAGGER = 0.06;

/** Scroll reveal: gap between blocks that come into view together, in ms. */
export const REVEAL_STAGGER_MS = 90;
/** Scroll reveal: only the first few blocks of a batch wait, so none lags far behind. */
export const REVEAL_MAX_STAGGER_STEPS = 4;

/** Transition delay for the index-th block revealed in one batch. */
export function revealDelay(index: number): number {
  return Math.min(Math.max(index, 0), REVEAL_MAX_STAGGER_STEPS) * REVEAL_STAGGER_MS;
}
