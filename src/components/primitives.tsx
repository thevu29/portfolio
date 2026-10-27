import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/content/cv";
import { STAGGER } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./icons";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8", className)}>{children}</main>
  );
}

interface RiseProps {
  children: ReactNode;
  /** Position in the entrance sequence; each step adds STAGGER. */
  step?: number;
  className?: string;
}

/**
 * Above-the-fold entrance: pure CSS, so content is visible without JS and
 * the hero paints immediately (no opacity-0 SSR). Off under reduced motion.
 */
export function Rise({ children, step = 0, className }: RiseProps) {
  return (
    <div
      className={cn("animate-rise motion-reduce:animate-none", className)}
      style={{ animationDelay: `${step * STAGGER * 1000}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Below-the-fold reveal tied to the scroll (CSS scroll-driven animation, see
 * .reveal in globals.css): rises in from below, drifts out at the top, and
 * plays back when scrolling up. No JS; static where unsupported or with
 * reduced motion. Use on item-sized blocks, not whole pages.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("reveal", className)}>{children}</div>;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

/** Centered page title used inside HeroFrame on inner pages. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Rise>
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {eyebrow}
        </p>
      </Rise>
      <Rise step={1}>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
      </Rise>
      {description && (
        <Rise step={2}>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl leading-relaxed text-pretty">
            {description}
          </p>
        </Rise>
      )}
      {children && <Rise step={3}>{children}</Rise>}
    </div>
  );
}

interface SectionProps {
  index: string;
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
}

/** Section with a mono "01 — Title" label, the site's structural motif. */
export function Section({ index, title, children, id, className }: SectionProps) {
  const headingId = `${id ?? title.toLowerCase().replace(/\W+/g, "-")}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("mt-24 first:mt-0", className)}>
      <h2
        id={headingId}
        className="reveal text-muted-foreground mb-6 font-mono text-xs tracking-wide uppercase"
      >
        <span className="text-subtle">{index}</span> — {title}
      </h2>
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
}

/** Large centered heading that opens a home-page section. */
export function SectionHeading({ eyebrow, title, description, id }: SectionHeadingProps) {
  return (
    <div className="reveal mx-auto mb-12 max-w-xl text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl font-medium tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">{description}</p>
      )}
    </div>
  );
}

/** Outer rounded container for list rows ("card in card"). */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bg-card rounded-3xl border p-2", className)}>{children}</div>;
}

/** A row inside a Panel. */
export function PanelRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-background/60 hover:bg-muted/60 rounded-2xl px-4 py-3.5 transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small outline chips with brand icons. */
export function TechChips({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label ?? "Tech stack"} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Badge
            variant="outline"
            className="text-muted-foreground h-6 px-2.5 font-mono text-[11px] font-normal"
          >
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function initials(name: string): string {
  const parts = name.split(/\s+/);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  profile,
  size = 64,
  className,
}: {
  profile: Profile;
  size?: number;
  className?: string;
}) {
  if (profile.avatar) {
    return (
      <Image
        src={profile.avatar}
        alt={profile.name}
        width={size}
        height={size}
        quality={90}
        priority
        className={cn("rounded-full border object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={profile.name}
      style={{ width: size, height: size, fontSize: size * 0.28 }}
      className={cn(
        "bg-card text-muted-foreground flex items-center justify-center rounded-full border font-mono",
        className,
      )}
    >
      {initials(profile.name)}
    </div>
  );
}

const linkClass =
  "inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground";

export function ContactLinks({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-sm", className)}>
      <li>
        <a href={`mailto:${profile.email}`} className={linkClass}>
          <MailIcon />
          {profile.email}
        </a>
      </li>
      <li>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <GitHubIcon />
          GitHub
        </a>
      </li>
      <li>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <LinkedInIcon />
          LinkedIn
        </a>
      </li>
    </ul>
  );
}
