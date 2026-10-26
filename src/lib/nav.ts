export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export type NavTransition = "nav-forward" | "nav-back";

/** Position of a pathname in the page order, or -1 outside it. */
function pageIndex(pathname: string): number {
  return NAV_ITEMS.findIndex((item) => isActive(pathname, item.href));
}

/**
 * View-transition types for a link from `pathname` to `href`: pages read like
 * a book in NAV_ITEMS order, so a later page slides in forward and an earlier
 * one back (one slide, however many pages apart). Same page, external URLs
 * and pages outside the order: no slide.
 */
export function navTransitionTypes(pathname: string, href: string): NavTransition[] {
  const target = new URL(href, "http://site.invalid");
  if (target.origin !== "http://site.invalid") return [];
  const from = pageIndex(pathname);
  const to = pageIndex(target.pathname);
  if (from < 0 || to < 0 || from === to) return [];
  return [to > from ? "nav-forward" : "nav-back"];
}
