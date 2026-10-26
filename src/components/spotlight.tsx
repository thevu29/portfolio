"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

const FINE_POINTER = "(pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Writes the pointer position into --x/--y on `targetRef` (rAF-throttled)
 * while the pointer is over the target, or anywhere in the window when
 * `wholeWindow` is set. Mouse only; off under reduced motion.
 */
function usePointerVars(targetRef: RefObject<HTMLElement | null>, wholeWindow = false): void {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const area: HTMLElement | Window = wholeWindow ? window : target;
    if (!matchMedia(FINE_POINTER).matches || matchMedia(REDUCED_MOTION).matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--x", `${e.clientX - rect.left}px`);
        target.style.setProperty("--y", `${e.clientY - rect.top}px`);
        target.dataset.spotlight = "on";
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      delete target.dataset.spotlight;
    };
    const leaveTarget = wholeWindow ? document.documentElement : target;
    area.addEventListener("pointermove", onMove as EventListener);
    leaveTarget.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", onMove as EventListener);
      leaveTarget.removeEventListener("pointerleave", onLeave);
    };
  }, [targetRef, wholeWindow]);
}

/** Page-wide soft light that follows the cursor (behind all content). */
export function SpotlightBackground() {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref, true);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 opacity-0 transition-opacity duration-500 data-[spotlight=on]:opacity-100"
      style={{
        background:
          "radial-gradient(600px circle at var(--x, 50%) var(--y, 0%), var(--spotlight), transparent 80%)",
      }}
    />
  );
}

/** Card whose border lights up around the cursor. */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref);

  return (
    <div ref={ref} className={cn("group/spot relative h-full rounded-3xl", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-data-[spotlight=on]/spot:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--x) var(--y), color-mix(in srgb, var(--foreground) 35%, transparent), transparent 70%)",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          padding: 1,
        }}
      />
      {children}
    </div>
  );
}
