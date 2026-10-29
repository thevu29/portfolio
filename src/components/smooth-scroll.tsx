"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Lenis smooth scrolling for the whole page. Lenis itself honours
 * prefers-reduced-motion (smoothing off, instant anchor jumps). lerp 0.25
 * settles a wheel step in ~0.2s, close to the browser's own smooth scroll
 * (the 0.1 default takes ~0.5s and reads as sluggish).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.25, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
