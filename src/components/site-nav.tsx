"use client";

import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export function SiteNav() {
  const pathname = usePathname();

  return (
    // The header is position: fixed, so the pill's layout animation must
    // ignore page scroll (else it springs in from the old scroll offset).
    // Motion only treats a fixed ancestor as a scroll root when it also has
    // layoutScroll (motion-dom updateScroll/checkIsScrollRoot).
    // .site-header: the nav stays put while pages slide (globals.css).
    <motion.header
      layoutRoot
      layoutScroll
      className="site-header fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        aria-label="Main"
        className="border-border bg-background/80 flex items-center gap-1 rounded-full border p-1 shadow-sm backdrop-blur-md"
      >
        <LayoutGroup id="nav">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <NavLink
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-border/70 absolute inset-0 -z-10 rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                  />
                )}
                {label}
              </NavLink>
            );
          })}
        </LayoutGroup>
        <span className="bg-border mx-1 h-4 w-px" aria-hidden="true" />
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}
