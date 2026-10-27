"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { revealDelay } from "@/lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  // Respect OS "reduce motion": transforms are dropped, opacity fades stay.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Drives every `.reveal` block on the page (CSS in globals.css): a block that
 * leaves the screen is hidden on the side it left by (data-reveal="above" or
 * "below"), and plays a timed transition back in when it returns, so a fast
 * flick still shows the whole entrance. Blocks arriving together stagger.
 * The hidden offsets push blocks away from the screen, so the observer never
 * flips a block back and forth. Nothing runs under reduced motion; without
 * JS the blocks have no data-reveal and stay visible.
 */
export function ScrollReveal(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      let shown = 0;
      for (const { target, isIntersecting, boundingClientRect, rootBounds } of entries) {
        const el = target as HTMLElement;
        // A page kept hidden by the router (display: none) keeps its state.
        if (!boundingClientRect.width && !boundingClientRect.height) continue;
        if (isIntersecting) {
          if (el.dataset.reveal === "in") continue;
          el.style.transitionDelay = `${revealDelay(shown++)}ms`;
          el.dataset.reveal = "in";
        } else {
          el.style.transitionDelay = "";
          el.dataset.reveal =
            boundingClientRect.bottom <= (rootBounds?.top ?? 0) ? "above" : "below";
        }
      }
    });
    for (const el of document.querySelectorAll(".reveal")) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
