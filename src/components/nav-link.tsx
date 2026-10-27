"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ComponentProps, type MouseEvent } from "react";
import { navTransitionTypes, type NavTransition } from "@/lib/nav";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href" | "transitionTypes"> & {
  href: string;
};

// The slide direction also goes on <html data-slide> and the CSS keys off that,
// not off the class React sets (style.viewTransitionClass). It must stay until
// the view transition has finished: on iPhones the new page is captured well
// after React commits, and dropping the attribute before the animations ran
// left Safari's default in-place crossfade, with both pages overlapping.
const SLIDE_GIVE_UP_MS = 10_000; // navigation never happened (e.g. offline)
let watch = 0;

// Running animations only: WebKit keeps finished/idle ones (fill: both) listed.
const transitionRunning = () =>
  document
    .getAnimations()
    .some(
      (a) =>
        a.playState === "running" &&
        (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition"),
    );

function markSlide(type: NavTransition): void {
  const root = document.documentElement;
  root.dataset.slide = type === "nav-forward" ? "forward" : "back";
  cancelAnimationFrame(watch);
  const start = performance.now();
  let started = false;
  // Clear once a view transition has run and ended (or never came).
  const check = (now: number) => {
    const running = transitionRunning();
    started ||= running;
    if ((started && !running) || now - start > SLIDE_GIVE_UP_MS) {
      delete root.dataset.slide;
      return;
    }
    watch = requestAnimationFrame(check);
  };
  watch = requestAnimationFrame(check);
}

// Reduced motion: no slide at all (not a 0s one: WebKit crashed on those).
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const prefersReducedMotion = () => matchMedia(REDUCED_MOTION).matches;

const isPlainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;

/** Internal page link: slides forward or back by page order (PageTransition). */
export function NavLink({ href, onClick, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const reduceMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const types = reduceMotion ? [] : navTransitionTypes(pathname, href);

  return (
    <Link
      href={href}
      transitionTypes={types.length ? types : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (types.length && isPlainClick(e)) markSlide(types[0]);
      }}
      {...props}
    />
  );
}
