import type { ReactNode } from "react";
import { LightRays } from "./light-rays";

interface HeroFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * Rounded frame at the top of every page with light rays behind the header
 * content, fading into the page background at the bottom.
 */
export function HeroFrame({ children, className = "" }: HeroFrameProps) {
  return (
    <div className="px-2 pt-2 sm:px-3 sm:pt-3">
      <section
        className={`hero-frame border-border relative isolate overflow-hidden rounded-[2rem] border ${className}`}
      >
        <LightRays className="absolute inset-0 -z-10" />
        <div className="grain absolute inset-0 -z-10 opacity-[0.035]" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="to-background absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent"
        />
        <div className="mx-auto w-full max-w-5xl px-5 pt-32 pb-16 sm:px-8 sm:pt-36 sm:pb-20">
          {children}
        </div>
      </section>
    </div>
  );
}
