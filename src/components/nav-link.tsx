"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentProps, type MouseEvent } from "react";
import { navTransitionTypes, type NavTransition } from "@/lib/nav";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href" | "transitionTypes"> & {
  href: string;
};

// The slide direction also goes on <html data-slide> and the CSS keys off that,
// not off the class React sets (style.viewTransitionClass): iOS Safari ignored
// the class and fell back to an in-place crossfade where both pages overlap.
const SLIDE_SETTLE_MS = 900; // after the route commits: the slide has finished
const SLIDE_GIVE_UP_MS = 10_000; // navigation never happened (e.g. offline)
let giveUp = 0;

function markSlide(type: NavTransition): void {
  const root = document.documentElement;
  root.dataset.slide = type === "nav-forward" ? "forward" : "back";
  window.clearTimeout(giveUp);
  giveUp = window.setTimeout(() => delete root.dataset.slide, SLIDE_GIVE_UP_MS);
}

const isPlainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;

/** Internal page link: slides forward or back by page order (PageTransition). */
export function NavLink({ href, onClick, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const types = navTransitionTypes(pathname, href);

  // Arrived on a new route: drop the direction once its slide has played.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.slide) return;
    const timer = window.setTimeout(() => delete root.dataset.slide, SLIDE_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

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
