"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  // Respect OS "reduce motion": transforms are dropped, opacity fades stay.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

interface RevealProps {
  children: ReactNode;
  /** Seconds; use multiples of STAGGER for sequenced items. */
  delay?: number;
  className?: string;
}

/**
 * Fades content up 8px the first time it scrolls into view. Below-the-fold
 * only: it renders at opacity 0 until hydration. Above the fold use <Rise>.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
