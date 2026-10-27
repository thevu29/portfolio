import { expect, test, type Page } from "@playwright/test";
import { cv } from "../../src/content/cv";

const ROUTES = [
  { path: "/", heading: /Software engineer building reliable web products/, nav: "Home" },
  { path: "/projects", heading: "Things I've built", nav: "Projects" },
  { path: "/about", heading: "Hello, I'm Vu.", nav: "About" },
  { path: "/cv", heading: cv.profile.name, nav: "CV" },
] as const;

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });

for (const route of ROUTES) {
  test(`${route.path} renders without console errors and marks nav active`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
    await expect(nav(page).getByRole("link", { name: route.nav })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(errors).toEqual([]);
  });
}

test("nav links navigate between pages", async ({ page }) => {
  await page.goto("/");
  await nav(page).getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await nav(page).getByRole("link", { name: "CV" }).click();
  await expect(page).toHaveURL(/\/cv$/);
  await expect(nav(page).getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("nav pill slides within the nav after navigating from a scrolled page", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => window.scrollY > 1000);
  // Record the active pill's viewport top on every frame of the transition.
  await page.evaluate(() => {
    const tops: number[] = [];
    (window as unknown as { __pillTops: number[] }).__pillTops = tops;
    const start = performance.now();
    const sample = () => {
      const pill = document.querySelector("nav[aria-label=Main] a[aria-current=page] > span");
      if (pill) tops.push(pill.getBoundingClientRect().top);
      if (performance.now() - start < 1500) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await nav(page).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.waitForTimeout(1600);
  const tops = await page.evaluate(
    () => (window as unknown as { __pillTops: number[] }).__pillTops,
  );
  const navBox = await nav(page).boundingBox();
  expect(tops.length).toBeGreaterThan(0);
  // The pill must never leave the fixed nav (it used to spring up from the old scroll offset).
  expect(Math.max(...tops)).toBeLessThanOrEqual(navBox!.y + navBox!.height);
});

test.describe("page slides (pages read in nav order)", () => {
  /** Records the slide keyframes React's view transition runs. */
  const recordSlides = (page: Page) =>
    page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { __slides: string[] }).__slides = seen;
      const sample = () => {
        for (const a of document.getAnimations()) {
          const effect = a.effect as KeyframeEffect | null;
          const name = (a as CSSAnimation).animationName;
          if (!name?.startsWith("page-slide") || !effect?.pseudoElement) continue;
          const side = effect.pseudoElement.includes("old") ? "old" : "new";
          // Direction only (sign of the resolved offset), so the distance can be tuned.
          const offset = String(
            effect.getKeyframes().find((k) => k.translate && k.translate !== "none")?.translate ??
              "",
          );
          const entry = `${side}:${offset.startsWith("-") ? "left" : "right"}`;
          if (!seen.includes(entry)) seen.push(entry);
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  const slides = (page: Page) =>
    page.evaluate(() => (window as unknown as { __slides: string[] }).__slides);
  // Before hydration a <Link> is a plain <a>: a full page load, no transition.
  const hydrated = (page: Page) => expect(page.locator("html")).toHaveClass(/\blenis\b/);

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("a later page slides in from the right", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await recordSlides(page);
    await nav(page).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect
      .poll(() => slides(page))
      .toEqual(expect.arrayContaining(["old:left", "new:right"]));
  });

  test("an earlier page slides in from the left", async ({ page }) => {
    await page.goto("/cv");
    await hydrated(page);
    await recordSlides(page);
    await nav(page).getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect
      .poll(() => slides(page))
      .toEqual(expect.arrayContaining(["old:right", "new:left"]));
  });

  test("the old page is gone before the new one shows (no overlap)", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.evaluate(() => {
      const fades: { side: string; start: number; end: number }[] = [];
      (window as unknown as { __fades: typeof fades }).__fades = fades;
      const sample = () => {
        for (const a of document.getAnimations()) {
          const pseudo = (a.effect as KeyframeEffect | null)?.pseudoElement ?? "";
          if (!(a as CSSAnimation).animationName?.startsWith("page-fade") || !pseudo) continue;
          const side = pseudo.includes("old") ? "old" : "new";
          if (fades.some((f) => f.side === side)) continue;
          const { delay = 0, duration = 0 } = a.effect!.getComputedTiming();
          fades.push({ side, start: Number(delay), end: Number(delay) + Number(duration) });
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await nav(page).getByRole("link", { name: "Projects" }).click();
    const fades = await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __fades: { side: string; start: number; end: number }[] })
              .__fades,
        ),
      )
      .toHaveLength(2)
      .then(() =>
        page.evaluate(
          () =>
            (window as unknown as { __fades: { side: string; start: number; end: number }[] })
              .__fades,
        ),
      );
    const old = fades.find((f) => f.side === "old")!;
    const next = fades.find((f) => f.side === "new")!;
    expect(next.start).toBeGreaterThanOrEqual(old.end);
  });

  test("still slides where view-transition-class is ignored (iOS Safari)", async ({ page }) => {
    // React tags the page with style.viewTransitionClass; on iOS that never
    // matched, leaving the browser's default in-place crossfade (overlap).
    await page.addInitScript(() => {
      Object.defineProperty(CSSStyleDeclaration.prototype, "viewTransitionClass", {
        configurable: true,
        get: () => "",
        set: () => {},
      });
    });
    await page.goto("/");
    await hydrated(page);
    await recordSlides(page);
    await nav(page).getByRole("link", { name: "About" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-slide", "forward");
    await expect
      .poll(() => slides(page))
      .toEqual(expect.arrayContaining(["old:left", "new:right"]));
    // Cleared once the slide is over.
    await expect(page.locator("html")).not.toHaveAttribute("data-slide", { timeout: 3_000 });
  });

  test("the nav stays put while the page slides", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toHaveCSS("view-transition-name", "site-header");
  });

  test("no slide under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await hydrated(page);
    await nav(page).getByRole("link", { name: "Projects" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Things I've built" })).toBeVisible();
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName?.startsWith("page-slide"))
        .map((a) => a.effect?.getComputedTiming().duration),
    );
    expect(running.every((d) => d === 0)).toBe(true);
  });
});

test.describe("theme", () => {
  const html = (page: Page) => page.locator("html");

  /** Counts document.startViewTransition calls (the page-wide theme switch). */
  const countViewTransitions = (page: Page) =>
    page.addInitScript(() => {
      const w = window as unknown as { __switches: number };
      w.__switches = 0;
      const original = document.startViewTransition?.bind(document);
      if (!original) return;
      document.startViewTransition = ((update: () => void) => {
        w.__switches += 1;
        return original(update);
      }) as typeof document.startViewTransition;
    });
  const switches = (page: Page) =>
    page.evaluate(() => (window as unknown as { __switches: number }).__switches);

  /** Records `<animation>::<pseudo>` names run on the view-transition root. */
  const recordRootAnimations = (page: Page) =>
    page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { __root: string[] }).__root = seen;
      const sample = () => {
        for (const a of document.getAnimations()) {
          const pseudo = (a.effect as KeyframeEffect | null)?.pseudoElement ?? "";
          const entry = `${(a as CSSAnimation).animationName}${pseudo}`;
          if (pseudo.endsWith("(root)") && !seen.includes(entry)) seen.push(entry);
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  const rootAnimations = (page: Page) =>
    page.evaluate(() => (window as unknown as { __root: string[] }).__root);

  test("defaults to dark before first paint, even when the OS prefers light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      requestAnimationFrame(() => {
        (window as unknown as { __firstFrameTheme?: string }).__firstFrameTheme =
          document.documentElement.dataset.theme;
      });
    });
    await page.goto("/");
    const first = await page.evaluate(
      () => (window as unknown as { __firstFrameTheme?: string }).__firstFrameTheme,
    );
    expect(first).toBe("dark");
    await expect(page.getByRole("button", { name: "Theme: dark. Switch to light." })).toBeVisible();
  });

  test("toggles light ↔ dark only and persists across reloads", async ({ page }) => {
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: /Switch to light/ }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("button", { name: "Theme: light. Switch to dark." })).toBeVisible();

    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: /Switch to dark/ }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
  });

  test("an old stored 'system' preference falls back to dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => localStorage.setItem("theme", "system"));
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
  });

  test("light rises over the whole page like the sun; dark comes as it sets", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await countViewTransitions(page);
    await page.goto("/");
    await expect(html(page)).toHaveClass(/\blenis\b/); // hydrated
    await recordRootAnimations(page);

    await page.getByRole("button", { name: /Switch to light/ }).click();
    await expect.poll(() => rootAnimations(page)).toContain("sunrise::view-transition-new(root)");
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(html(page)).not.toHaveAttribute("data-theme-switch");

    await page.getByRole("button", { name: /Switch to dark/ }).click();
    await expect.poll(() => rootAnimations(page)).toContain("sunset::view-transition-old(root)");
    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(html(page)).not.toHaveAttribute("data-theme-switch");
    expect(await switches(page)).toBe(2);
  });

  test("the nav switches with the page (not ahead of it)", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toHaveCSS("view-transition-name", "site-header");
    await page.evaluate(() => (document.documentElement.dataset.themeSwitch = "sunrise"));
    await expect(header).toHaveCSS("view-transition-name", "none");
  });

  test("switches instantly under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await countViewTransitions(page);
    await page.goto("/");
    await page.getByRole("button", { name: /Switch to light/ }).click();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    expect(await switches(page)).toBe(0);
    await expect(page.locator('[data-theme-icon="sun"]')).toHaveCSS("transition-property", "none");
  });

  test("the toggle icon sets and rises with the theme", async ({ page }) => {
    await page.goto("/");
    const opacity = (name: string) =>
      page.locator(`[data-theme-icon="${name}"]`).evaluate((el) => getComputedStyle(el).opacity);
    await expect.poll(() => opacity("moon")).toBe("1");
    await page.getByRole("button", { name: /Switch to light/ }).click();
    await expect.poll(() => opacity("sun")).toBe("1");
    await expect.poll(() => opacity("moon")).toBe("0");
  });

  test("/cv follows the site theme (not a white sheet)", async ({ page }) => {
    await page.goto("/cv");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(10, 10, 10)");
  });
});

test.describe("CV page", () => {
  test("lists every company, role, project and school as HTML", async ({ page }) => {
    await page.goto("/cv");
    const main = page.locator("main");
    for (const exp of cv.experience) {
      await expect(main).toContainText(exp.company);
      for (const role of exp.roles) await expect(main).toContainText(role.title);
    }
    for (const project of cv.projects) {
      await expect(main).toContainText(`${project.name} — ${project.subtitle}`);
    }
    for (const edu of cv.education) await expect(main).toContainText(edu.school);
  });

  test("hides the phone number (it stays in the PDF only)", async ({ page }) => {
    await page.goto("/cv");
    await expect(page.getByRole("link", { name: cv.profile.email }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(cv.profile.phone);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("Download PDF serves the generated PDF", async ({ page, request }) => {
    await page.goto("/cv");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Download PDF" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("CV_NguyenTheVu.pdf");

    const res = await request.get("/CV_NguyenTheVu.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    expect((await res.body()).subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});

test("home project cards jump to that project on /projects", async ({ page }) => {
  await page.goto("/");
  const target = cv.projects[2];
  await page
    .getByRole("link", { name: new RegExp(target.name) })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/projects#${target.slug}$`));
  await expect(page.locator(`#${target.slug}`)).toBeInViewport();
});

test("projects page shows full details without toggles", async ({ page }) => {
  await page.goto("/projects");
  for (const project of cv.projects) {
    await expect(page.locator(`#${project.slug}`)).toContainText(project.bullets[0]);
  }
  await expect(page.getByRole("button", { name: /show details/i })).toHaveCount(0);
});

test("email links use mailto", async ({ page }) => {
  await page.goto("/");
  const mail = page.getByRole("link", { name: cv.profile.email });
  await expect(mail).toHaveAttribute("href", `mailto:${cv.profile.email}`);
});

test("experience timeline shows roles with LinkedIn-style dates", async ({ page }) => {
  await page.goto("/about");
  const company = page.getByRole("article", { name: "Golden Owl Solutions" });
  await expect(company).toContainText("Full-time");
  await expect(company).toContainText("Mar 2025 – Aug 2025 · 6 mos");
  // Ongoing role's duration is computed on the client.
  await expect(company).toContainText(/Sep 2025 – Present · \d+ (yrs?|mos?)/);
});

test.describe("smooth scroll", () => {
  test("Lenis is mounted on the document", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  });

  test("skip link still moves focus to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("#content")).toBeFocused();
  });
});

test.describe("hero light rays", () => {
  const rays = (page: Page) => page.locator("[data-rays]").first();

  test("render with WebGL and are hidden from assistive tech", async ({ page }) => {
    await page.goto("/");
    await expect(rays(page)).toHaveAttribute("aria-hidden", "true");
    await expect(rays(page)).toHaveAttribute("data-rays", /webgl|fallback/);
  });

  test("are static under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(rays(page)).toHaveAttribute("data-rays", /static|fallback/);
  });
});

test.describe("stack physics", () => {
  // Matter is a lazy chunk fetched after scroll-in: slow under machine load.
  const MATTER_LOAD = { timeout: 15_000 };
  const box = (page: Page) => page.locator("[data-stack-mode]");

  /** Hydrate, then scroll the box into view (again, if a late scroll moved it away). */
  async function enterPhysics(page: Page): Promise<void> {
    await page.goto("/about");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await expect(async () => {
      await box(page).scrollIntoViewIfNeeded();
      await expect(box(page)).toHaveAttribute("data-stack-mode", "physics", { timeout: 3_000 });
    }).toPass(MATTER_LOAD);
  }

  async function chipTransforms(page: Page): Promise<string[]> {
    return box(page)
      .locator("[data-chip]")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
  }

  test("chips drop and move once the block scrolls into view", async ({ page }) => {
    await enterPhysics(page);
    const first = await chipTransforms(page);
    await expect.poll(() => chipTransforms(page)).not.toEqual(first);
  });

  test("reset drops the chips again", async ({ page }) => {
    await enterPhysics(page);
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLElement>("[data-chip]")].every((el) =>
        el.style.transform.includes("translate"),
      ),
    );
    const settled = await chipTransforms(page);
    await page.getByRole("button", { name: "Drop the stack again" }).click();
    await expect.poll(() => chipTransforms(page)).not.toEqual(settled);
  });

  test("a chip can be dragged with the mouse", async ({ page }) => {
    await enterPhysics(page);
    // Let the pile (and the page) come to rest so the chip stays under the cursor.
    const state = () =>
      page.evaluate(
        () =>
          `${window.scrollY}|` +
          [...document.querySelectorAll<HTMLElement>("[data-chip]")]
            .map((el) => el.style.transform)
            .join("|"),
      );
    await expect(async () => {
      const before = await state();
      await page.waitForTimeout(400);
      expect(await state()).toBe(before);
    }).toPass(MATTER_LOAD);
    const chip = await box(page)
      .locator("[data-chip]")
      .evaluateAll((els) => {
        const hittable = els
          .map((el, index) => {
            const r = el.getBoundingClientRect();
            return { el, index, x: r.left + r.width / 2, y: r.top + r.height / 2 };
          })
          .filter(({ el, x, y }) => document.elementFromPoint(x, y)?.closest("[data-chip]") === el);
        const { index, x, y } = hittable.reduce((a, b) => (b.y < a.y ? b : a));
        return { index, x, y };
      });
    const target = box(page).locator("[data-chip]").nth(chip.index);
    // Pull towards the middle of the box so a wall never blocks the drag.
    const frame = (await box(page).boundingBox())!;
    const dx = chip.x < frame.x + frame.width / 2 ? 120 : -120;

    await page.mouse.move(chip.x, chip.y);
    await page.mouse.down();
    await expect(target).toHaveAttribute("data-grabbed");
    await page.mouse.move(chip.x + dx, chip.y - 60, { steps: 12 });
    await page.waitForTimeout(300);
    const moved = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.up();

    expect(Math.sign(moved.x - chip.x)).toBe(Math.sign(dx));
    expect(Math.abs(moved.x - chip.x)).toBeGreaterThan(60);
    await expect(target).not.toHaveAttribute("data-grabbed");
  });

  test("reduced motion shows a static list of every skill", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    await box(page).scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-stack-mode", "static");
    for (const name of ["React", "NestJS", "PostgreSQL", "Docker"]) {
      await expect(box(page)).toContainText(name);
    }
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const route of ROUTES) {
    test(`${route.path} has no horizontal scroll at 375px`, async ({ page }) => {
      await page.goto(route.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("scroll reveal", () => {
  /** Scroll-driven animations on an element: name and timeline. */
  const revealAnimations = (page: Page, selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) =>
        el.getAnimations().map((a) => ({
          name: (a as CSSAnimation).animationName,
          scrollLinked: !(a.timeline instanceof DocumentTimeline),
        })),
      );

  test("timeline roles and section headings reveal with the scroll, both ways", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/about");
    for (const selector of ["article li.reveal", "section .reveal"]) {
      const animations = await revealAnimations(page, selector);
      expect(animations).toEqual(
        expect.arrayContaining([
          { name: "reveal-in", scrollLinked: true },
          { name: "reveal-out", scrollLinked: true },
        ]),
      );
    }
  });

  test("content below the fold starts hidden and shows once scrolled to", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 430, height: 932 }); // iPhone Pro Max
    await page.goto("/about");
    const lastRole = page.locator("article li.reveal").last();
    const opacity = () => lastRole.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(await opacity()).toBeLessThan(0.1);
    await lastRole.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect.poll(opacity).toBeGreaterThan(0.95);
  });

  test("is off under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    expect(await revealAnimations(page, ".reveal")).toEqual([]);
    await expect(page.locator(".reveal").last()).toHaveCSS("opacity", "1");
  });
});

test.describe("entrance animation", () => {
  const firstWord = (page: Page) =>
    page
      .getByRole("heading", { level: 1 })
      .locator(".animate-blur-in")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);

  test("plays by default", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    expect(await firstWord(page)).toBe("blur-in");
  });

  test("is disabled under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(await firstWord(page)).toBe("none");
  });
});

test("favicon, icon and apple-icon are the avatar set", async ({ page, request }) => {
  await page.goto("/");
  const head = page.locator("head");
  await expect(head.locator('link[rel="icon"][href^="/favicon.ico"]')).toHaveCount(1);
  await expect(head.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute(
    "sizes",
    "192x192",
  );
  await expect(head.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("sizes", "180x180");

  const ico = await (await request.get("/favicon.ico")).body();
  // ICO header: reserved 0, type 1 (icon), 3 images (16, 32, 48).
  expect([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([0, 1, 3]);
  expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48]);
});

test("link preview (Open Graph) image is a 1200×630 PNG", async ({ page, request }) => {
  await page.goto("/");
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toHaveCount(1);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    `${cv.profile.name} — ${cv.profile.title}`,
  );

  const res = await request.get(new URL((await og.getAttribute("content"))!).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
  const png = await res.body();
  // PNG IHDR: width and height at bytes 16 and 20.
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test("unknown routes render the styled 404 page", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
