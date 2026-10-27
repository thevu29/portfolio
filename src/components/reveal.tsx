"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  // Respect OS "reduce motion": transforms are dropped, opacity fades stay.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
