"use client";

import { useEffect, useState } from "react";

// TEMPORARY on-device diagnostics for page slides on iOS Safari. Opt in with
// ?vtdebug=1 (kept for the tab via sessionStorage), off with ?vtdebug=0.
// Remove once the iOS slide issue is settled.
const KEY = "vtdebug";
const SAMPLE_MS = 1500;

function enabled(): boolean {
  try {
    const flag = new URLSearchParams(location.search).get(KEY);
    if (flag === "1") sessionStorage.setItem(KEY, "1");
    if (flag === "0") sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function supports(): string {
  const checks = {
    vtClass: "view-transition-class: a",
    vtName: "view-transition-name: a",
    viewTimeline: "animation-timeline: view()",
  };
  const parts = Object.entries(checks).map(([k, q]) => `${k}=${CSS.supports(q) ? 1 : 0}`);
  parts.push(`startVT=${typeof document.startViewTransition === "function" ? 1 : 0}`);
  parts.push(`styleVtClass=${"viewTransitionClass" in document.documentElement.style ? 1 : 0}`);
  return parts.join(" ");
}

export function VtDebug() {
  const [lines, setLines] = useState<string[] | null>(null);

  useEffect(() => {
    if (!enabled()) return;
    const head = [navigator.userAgent.replace(/^Mozilla\/5\.0 /, ""), supports()];
    const show = requestAnimationFrame(() => setLines(head));

    const onClick = () => {
      const seen = new Set<string>();
      let slideAtClick = ""; // read on the next frame: NavLink sets it after this listener
      const start = performance.now();
      const sample = () => {
        const slide = document.documentElement.dataset.slide ?? "-";
        slideAtClick ||= slide;
        for (const a of document.getAnimations()) {
          const effect = a.effect as KeyframeEffect | null;
          const pseudo = effect?.pseudoElement;
          if (!pseudo) continue;
          const name = (a as CSSAnimation).animationName ?? "(script)";
          const t = effect.getComputedTiming();
          const moved = effect.getKeyframes().find((k) => k.translate && k.translate !== "none");
          const move = moved ? ` tr=${String(moved.translate)}` : "";
          seen.add(
            `${name} ${pseudo} d=${Math.round(Number(t.duration))} dl=${Math.round(Number(t.delay))}${move} slide=${slide}`,
          );
        }
        if (performance.now() - start < SAMPLE_MS) requestAnimationFrame(sample);
        else
          setLines([
            ...head,
            `click: slide=${slideAtClick} -> ${location.pathname}`,
            ...(seen.size ? [...seen] : ["no view-transition animations seen"]),
          ]);
      };
      requestAnimationFrame(sample);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(show);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  if (!lines) return null;
  return (
    <pre className="pointer-events-none fixed inset-x-2 bottom-16 z-[200] max-h-[45vh] overflow-hidden rounded-lg bg-black/85 p-2 font-mono text-[9px] leading-tight whitespace-pre-wrap text-lime-300">
      {lines.join("\n")}
    </pre>
  );
}
