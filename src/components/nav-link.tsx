"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useSyncExternalStore, type ComponentProps, type MouseEvent } from "react";
import { navTransitionTypes } from "@/lib/nav";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

// Page slides run our own whole-page View Transition (root snapshot), not
// React's <ViewTransition> per element: on iOS Safari the element version
// played as an in-place crossfade with both pages overlapping. The direction
// goes on <html data-slide> for the CSS (globals.css) until the transition
// has finished.
const ARRIVAL_TIMEOUT_MS = 3_000; // the page is frozen until the new route shows
let arrive: (() => void) | null = null;

/** Called by SiteNav whenever the route changes: the new page is in the DOM. */
export function useSlideArrival(): void {
  const pathname = usePathname();
  useLayoutEffect(() => {
    arrive?.();
    arrive = null;
  }, [pathname]);
}

function slideTo(navigate: () => void, direction: "forward" | "back"): void {
  const root = document.documentElement;
  root.dataset.slide = direction;
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ARRIVAL_TIMEOUT_MS);
        arrive = () => {
          window.clearTimeout(timer);
          resolve();
        };
        navigate();
      }),
  );
  transition.finished.finally(() => {
    if (root.dataset.slide === direction) delete root.dataset.slide;
  });
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

/** Internal page link: slides forward or back by page order (NAV_ITEMS). */
export function NavLink({ href, onClick, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const [type] = reduceMotion ? [] : navTransitionTypes(pathname, href);

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (!type || !isPlainClick(e) || typeof document.startViewTransition !== "function") {
          return; // Link navigates as usual
        }
        e.preventDefault();
        slideTo(() => router.push(href), type === "nav-forward" ? "forward" : "back");
      }}
      {...props}
    />
  );
}
