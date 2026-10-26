import { ViewTransition, type ReactNode } from "react";

// Typed navigations (NavLink) slide; anything else (browser back/forward,
// refresh, same-page links) swaps instantly. CSS: .nav-forward / .nav-back in
// globals.css. Must wrap each page.tsx, not the layout (layouts persist, so
// enter/exit never fire there).
const SLIDE = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      {/* One element, so the page slides as one snapshot. */}
      <div>{children}</div>
    </ViewTransition>
  );
}
