"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import {
  DEFAULT_THEME,
  isTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
  toggleTheme,
  type Theme,
} from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const listeners = new Set<() => void>();

// <html data-theme> (set before paint by THEME_INIT_SCRIPT) is the source of
// truth, so the icon stays right even when storage is blocked.
function readTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : DEFAULT_THEME;
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  // Another tab changed the theme.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) applyTheme(readStoredTheme(event.newValue));
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

let activeSwitch: ViewTransition | undefined;

/**
 * Switches the whole page like the sun: daylight spreads from the east
 * (bottom-right) and withdraws into the west (bottom-left). CSS in
 * globals.css, keyed on data-theme-switch.
 * Instant when View Transitions are unsupported or motion is reduced.
 */
function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): theme still switches for this page view.
  }
  const root = document.documentElement;
  if (!document.startViewTransition || matchMedia(REDUCED_MOTION).matches) {
    applyTheme(theme);
    return;
  }
  root.dataset.themeSwitch = theme === "light" ? "sunrise" : "sunset";
  // flushSync: the new snapshot must include the re-rendered toggle.
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(theme)));
  activeSwitch = transition;
  transition.finished.finally(() => {
    if (activeSwitch === transition) delete root.dataset.themeSwitch;
  });
}

// Sun and moon share the button; its bottom edge is the horizon. The outgoing
// body sets below it while the incoming one rises a beat later. Driven by the
// dark: variant (data-theme), so the right icon shows before hydration.
const body =
  "absolute inset-0 m-auto transition-[translate,rotate,opacity] duration-500 ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  const next = toggleTheme(theme);

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      title={`Switch to ${next} theme`}
      className="text-muted-foreground hover:text-foreground relative inline-flex size-8 overflow-hidden rounded-full transition-colors"
    >
      <SunIcon
        data-theme-icon="sun"
        className={`${body} delay-150 dark:translate-y-6 dark:rotate-90 dark:opacity-0 dark:delay-0`}
      />
      <MoonIcon
        data-theme-icon="moon"
        className={`${body} translate-y-6 -rotate-90 opacity-0 dark:translate-y-0 dark:rotate-0 dark:opacity-100 dark:delay-150`}
      />
    </button>
  );
}
