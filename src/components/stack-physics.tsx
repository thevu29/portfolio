"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type MatterNS from "matter-js";
import { readableTextOn } from "@/lib/color";
import type { TechIconData } from "@/lib/tech";
import { TechIcon } from "./tech-icon";

// Brand chips that drop into the box, tumble and pile up (Matter.js), as in
// the reference design. Matter is loaded only when the box scrolls into view.
// Static wrapped layout is the SSR / no-JS / reduced-motion fallback.

type Mode = "static" | "physics";
type Matter = typeof MatterNS;

const WALL = 200;
const DROP_SPREAD = 0.7;
// Step by real elapsed time (same speed at 60/120/144 Hz), capped at Matter's
// recommended max delta so a resumed tab doesn't teleport the chips.
const MAX_STEP_MS = 1000 / 60;

// @types/matter-js omits Mouse's DOM handlers (present at runtime, see
// Mouse.setElement in matter-js/build/matter.js).
type MouseHandlers = Record<"mousemove" | "mousedown" | "mouseup" | "mousewheel", EventListener>;

interface World {
  engine: MatterNS.Engine;
  chips: { el: HTMLElement; body: MatterNS.Body; w: number; h: number }[];
  width: number;
  height: number;
}

function Chip({ tech }: { tech: TechIconData }) {
  return (
    <span
      data-chip
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 py-1.5 pr-3.5 pl-1.5 text-sm font-medium whitespace-nowrap shadow-sm select-none"
      style={{ backgroundColor: tech.hex, color: readableTextOn(tech.hex) }}
    >
      <TechIcon tech={tech} size={26} />
      {tech.title}
    </span>
  );
}

function buildWorld(M: Matter, box: HTMLElement): World {
  const width = box.clientWidth;
  const height = box.clientHeight;
  const engine = M.Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;

  const walls = [
    M.Bodies.rectangle(width / 2, height + WALL / 2, width + WALL * 2, WALL, { isStatic: true }),
    M.Bodies.rectangle(-WALL / 2, height / 2 - WALL, WALL, height * 3, { isStatic: true }),
    M.Bodies.rectangle(width + WALL / 2, height / 2 - WALL, WALL, height * 3, { isStatic: true }),
  ];

  const chips = [...box.querySelectorAll<HTMLElement>("[data-chip]")].map((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = width / 2 + (Math.random() - 0.5) * width * DROP_SPREAD;
    const y = -h * (i + 1) * 0.9;
    const body = M.Bodies.rectangle(x, y, w, h, {
      chamfer: { radius: h * 0.3 },
      angle: (Math.random() - 0.5) * 0.8,
      restitution: 0.25,
      friction: 0.35,
      frictionAir: 0.012,
    });
    return { el, body, w, h };
  });

  M.Composite.add(engine.world, [...walls, ...chips.map((c) => c.body)]);
  return { engine, chips, width, height };
}

function attachMouse(M: Matter, world: World, box: HTMLElement): () => void {
  // Touch screens keep native scrolling: no dragging there.
  if (!matchMedia("(pointer: fine)").matches) return () => {};
  const mouse = M.Mouse.create(box);
  const handlers = mouse as unknown as MouseHandlers;
  // Matter grabs wheel/touch events (passive: false, preventDefault) and would
  // block page scroll, also on touch laptops that report a fine pointer.
  box.removeEventListener("wheel", handlers.mousewheel);
  box.removeEventListener("touchmove", handlers.mousemove);
  box.removeEventListener("touchstart", handlers.mousedown);
  box.removeEventListener("touchend", handlers.mouseup);
  // Matter only hears mouseup inside the box: release a drag that leaves it.
  box.addEventListener("mouseleave", handlers.mouseup);
  const constraint = M.MouseConstraint.create(world.engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  M.Composite.add(world.engine.world, constraint);
  return () => {
    M.Mouse.clearSourceEvents(mouse);
    for (const type of ["mousemove", "mousedown", "mouseup"] as const) {
      box.removeEventListener(type, handlers[type]);
    }
    box.removeEventListener("mouseleave", handlers.mouseup);
  };
}

export function StackPhysics({ items }: { items: TechIconData[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("static");
  const [generation, setGeneration] = useState(0);
  const matterRef = useRef<Matter | null>(null);

  // Load Matter once the box is near the viewport (and motion is allowed).
  useEffect(() => {
    const box = boxRef.current;
    if (!box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        try {
          matterRef.current = (await import("matter-js")).default;
          setMode("physics");
        } catch {
          // Network/chunk failure: keep the static layout.
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  // Run the simulation; restarts on reset (generation) and on resize.
  // Layout effect: place the chips before the first physics-mode paint.
  useLayoutEffect(() => {
    const M = matterRef.current;
    const box = boxRef.current;
    if (mode !== "physics" || !M || !box) return;

    let world = buildWorld(M, box);
    let detachMouse = attachMouse(M, world, box);
    let frame = 0;
    // Timestamp of the previous frame; unset after a pause.
    let last: number | undefined;
    let visible = true;

    const render = () => {
      for (const { el, body, w, h } of world.chips) {
        el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
      }
    };
    const tick = (now: number) => {
      // Matter divides by the previous delta: never step by 0 or less.
      if (last !== undefined && now > last) {
        M.Engine.update(world.engine, Math.min(now - last, MAX_STEP_MS));
      }
      last = now;
      render();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = undefined;
      if (visible && document.visibilityState === "visible") frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(box);

    let lastWidth = world.width;
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      detachMouse();
      M.Engine.clear(world.engine);
      world = buildWorld(M, box);
      detachMouse = attachMouse(M, world, box);
    });
    ro.observe(box);
    document.addEventListener("visibilitychange", sync);
    render();
    sync();

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      detachMouse();
      M.Engine.clear(world.engine);
    };
  }, [mode, generation]);

  const reset = useCallback(() => setGeneration((g) => g + 1), []);

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border">
      <ul className="sr-only">
        {items.map((tech) => (
          <li key={tech.title}>{tech.title}</li>
        ))}
      </ul>
      {mode === "physics" && (
        <button
          type="button"
          onClick={reset}
          aria-label="Drop the stack again"
          className="border-border bg-background/70 text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10 inline-flex size-10 items-center justify-center rounded-2xl border backdrop-blur transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      )}
      <div
        ref={boxRef}
        aria-hidden="true"
        data-stack-mode={mode}
        className={
          mode === "physics"
            ? "relative h-[320px] cursor-grab active:cursor-grabbing sm:h-[360px] [&>[data-chip]]:absolute [&>[data-chip]]:top-0 [&>[data-chip]]:left-0 [&>[data-chip]]:will-change-transform"
            : "flex flex-wrap content-end justify-center gap-2 p-6 sm:min-h-[240px]"
        }
      >
        {items.map((tech) => (
          <Chip key={`${tech.title}-${generation}`} tech={tech} />
        ))}
      </div>
    </div>
  );
}
