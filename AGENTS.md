<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio — Nguyen The Vu

Personal portfolio for a software engineer: Home, Projects, About and CV pages, with a downloadable PDF CV that matches the Canva CV (design `DAGIXn6uxjY`). Deployed on Vercel; `.dev` domain with DNS on Cloudflare (DNS only, grey cloud).

## Stack

- Next.js 16.4 App Router, React 19, TypeScript, Turbopack, **`cacheComponents: true`**
- Tailwind CSS v4 (tokens in `src/app/globals.css`, shadcn naming), **shadcn/ui on Base UI** (`src/components/ui/*`, CLI-managed — don't hand-edit unless needed)
- `motion` (scroll reveals, nav pill), `lenis` (smooth scroll), `matter-js` (About "Stack", lazy-loaded), `simple-icons` (brand logos, server-only via `src/lib/tech.ts`), `@react-pdf/renderer` (CV PDF), `lucide-react` icons
- Fonts: Geist Sans/Mono (site); IBM Plex Sans 400/700 only inside the PDF (`@fontsource`, same face as Canva)
- pnpm; package is ESM (`"type": "module"`)

## Commands

```bash
pnpm dev            # generates the CV PDF, then next dev
pnpm build          # generates the CV PDF, then next build
pnpm pdf            # regenerate public/CV_NguyenTheVu.pdf only
pnpm test           # vitest — tests/unit/**
pnpm test:e2e       # playwright — tests/e2e/** against `next start -p 3100` (build first; stop stale servers on 3100)
pnpm typecheck && pnpm lint && pnpm format:check
```

Definition of done: all of the above pass, fresh. Tests live in `tests/` (not next to source): `tests/unit/<mirrors src>`, `tests/e2e`.

## Architecture

- **`src/content/cv.ts` is the single source of truth** for every page and the PDF. Text mirrors the Canva CV verbatim; web-only fields: `profile.greetingName`, `profile.avatar`, `capabilities`, `experience[].logo/location`, `education[].logo`, `roles[].employmentType`, `projects[].image`.
- **CV PDF** is generated at build time by `scripts/generate-cv-pdf.tsx` → `public/CV_NguyenTheVu.pdf` (gitignored), not a route (route segment configs throw under `cacheComponents`). `src/pdf/*` keeps the Canva layout (px × 0.75 → pt, calibrated to the Canva export; 2 A4 pages, E-commerce Platform's Tech Stack ends page 1). react-pdf resolves unitless `lineHeight` against the style's own `fontSize` (default 18pt) — always set both.
- **`/cv`** is an HTML page in the site style (barox.dev/cv-like); it does not mimic the PDF. Download PDF links to the static file.
- **Pages**: every page header sits in `HeroFrame` (rounded frame + WebGL `LightRays`). Home: hero + portrait, `ProjectLinkCard` grid linking to `/projects#<slug>`, `ExperienceList` (LinkedIn-style timeline), contact CTA. Projects: one `ProjectCard` per row with full details (anchor targets). About: bio, timeline, education, "What I do", `StackPhysics`.
- **Motion layers**: CSS `Rise`/`BlurText` above the fold (visible without JS); below the fold `Reveal` / the `.reveal` class (in `primitives.tsx`) is a CSS **scroll-driven** animation (`animation-timeline: view()`): rises in on the way down, drifts out at the top and plays back on the way up; no JS, works with native iOS scrolling, static where unsupported. Put it on item-sized blocks (timeline roles, cards, section headings), never nested. Lenis for desktop scroll (off on touch by design); `SpotlightBackground`/`SpotlightCard` follow the mouse. All respect `prefers-reduced-motion`.
- **LightRays** (`src/components/light-rays.tsx`): raw WebGL at half CSS resolution and 30fps (cheap enough not to stall page navigations on phones), colour from `--rays-rgb/--rays-alpha`, paused offscreen/hidden tab, static frame under reduced motion, CSS fallback without WebGL. Exposes `data-rays` for tests.
- **StackPhysics**: Matter loaded on scroll-in; chips are DOM nodes moved by body transforms; dragging uses Pointer Events + a Matter constraint (not Matter's Mouse): mouse grabs at once, touch after a 180ms press-and-hold (a swipe still scrolls; while held, `touchmove` is prevented); the box grows to fit the pile on narrow screens (`fitPile`); static `<ul>` fallback. Exposes `data-stack-mode` and `data-grabbed` on the held chip.
- **Dates**: `src/lib/date.ts` (LinkedIn format, inclusive months). "Present" durations need today's date → `Duration` renders them client-side only (`new Date()` during prerender breaks Cache Components).
- **Theme**: light/dark only, **default dark** (OS preference ignored; an old stored `system` → dark). Inline `THEME_INIT_SCRIPT` sets `data-theme` before paint; `<html>` SSRs `data-theme="dark"`. `ThemeToggle` switches the whole page through a View Transition like the sun: to light, daylight spreads as a disc from the bottom-right corner, the east (`sunrise`); to dark, it withdraws into the bottom-left corner, the west (`sunset`). CSS in `globals.css`, keyed on `html[data-theme-switch]`, which also drops the nav's `site-header` name so it repaints with the page. Instant without View Transitions or under reduced motion. The toggle's sun/moon icons also set/rise (CSS transitions on `dark:`). Tailwind `dark:` keys off `data-theme` (not `.dark`).
- **Page slides**: `NavLink` (internal links) starts its own whole-page View Transition (`document.startViewTransition` + `router.push`; `SiteNav`'s `useSlideArrival` resolves it once the new route is in the DOM, 3s cap) and sets `<html data-slide="forward|back">` from the NAV_ITEMS order (`navTransitionTypes` in `src/lib/nav.ts`; one slide however far) until `transition.finished`. CSS in `globals.css` keys off that attribute with literal values (no `var()` inside view-transition pseudos). Not React's `<ViewTransition>`: per-element transitions played as an overlapping in-place crossfade on iOS Safari. Untyped navigations (browser back/forward, same page, 404), reduced motion and browsers without View Transitions swap instantly. The nav header has `.site-header` (`view-transition-name: site-header`) so it never moves.
- **Server/client boundary**: shared constants live in plain modules (`src/lib/*`), never in `"use client"` files (server gets a reference, not the value).
- **Env** (`.env.example`; `.env` is gitignored): `CONTACT_EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` are required and validated by `src/lib/contact.ts`, read by `cv.ts` at build time (server-only: `cv` must not be imported into `"use client"` modules). The PDF script, Vitest and Playwright load `.env` via `@next/env` (`scripts/load-env.ts`, configs).
- `NEXT_PUBLIC_SITE_URL` (validated in `src/lib/site.ts`) drives metadata, sitemap, JSON-LD and the Portfolio link; falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then localhost.

## Design rules

Dark-first "engineer" look inspired by rbp-portfolio / brittanychiang / magicui (not copied): neutral zinc, one green `signal` accent (status dot, focus), rounded "card in card" panels, mono for metadata. Project covers are typographic (NDA) — no tech logos on project cards; `project.image` swaps in a screenshot. Images: `next/image` with `qualities: [75, 90]`, AVIF/WebP; all image masters are **PNG** in `/public` (WebP is not accepted by the `icon`/`apple-icon` conventions). App icons (`src/app/favicon.ico` 16/32/48 round, `icon.png` 192 round, `apple-icon.png` 180 square) are generated from `public/avatar.png`.

## Gotchas

- `next/og`: any `<div>` with multiple children needs `display: flex`; interpolate text into one template string.
- `aria-labelledby` ids must not contain spaces (slugify).
- Motion layout animations (`layoutId`) inside a `position: fixed` element need `layoutRoot` **and** `layoutScroll` on the fixed element, or they spring in from the old page-scroll offset after navigation (see `SiteNav`).
- Matter `Engine.update` must never get a delta ≤ 0 (it divides by the previous delta → NaN positions).
- Stale CSS after editing `globals.css` (dev or build)? `rm -rf .next` — the Turbopack cache with the `@tailwindcss/turbopack` loader can keep the old stylesheet.
- e2e: wait for hydration (`html.lenis`) before clicking a `NavLink` when asserting a slide; before hydration it is a plain `<a>` (full load, no transition).
- `?vtdebug=1` shows a TEMPORARY on-device view-transition log (`src/components/vt-debug.tsx`); remove once iOS slides are confirmed.
- Local agent skills (`.agents/`, `.claude/skills/`, `skills-lock.json`) are gitignored and excluded from lint/format.
