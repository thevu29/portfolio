import { expect, test, type CDPSession, type Page } from "@playwright/test";

// Phone-sized touch device (pointer: coarse). Touches go through CDP so they
// are real touch events, with timing, not synthetic clicks.
test.use({ viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true });

const box = (page: Page) => page.locator("[data-stack-mode]");

async function openStack(page: Page): Promise<void> {
  await page.goto("/about");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/); // hydrated
  await expect(async () => {
    await box(page).scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-stack-mode", "physics", { timeout: 3_000 });
  }).toPass({ timeout: 15_000 });
  // Let the pile settle so only our gestures move chips.
  const transforms = () =>
    box(page)
      .locator("[data-chip]")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform).join("|"));
  await expect(async () => {
    const before = await transforms();
    await page.waitForTimeout(400);
    expect(await transforms()).toBe(before);
  }).toPass({ timeout: 15_000 });
}

/**
 * Centre of the highest chip a finger can actually hit there (not clipped by
 * the box, not under another chip): the least likely to be wedged in the pile.
 */
async function topChip(page: Page): Promise<{ index: number; x: number; y: number }> {
  return box(page)
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
}

const chipCenter = (page: Page, index: number) =>
  box(page)
    .locator("[data-chip]")
    .nth(index)
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

async function touch(
  cdp: CDPSession,
  type: "touchStart" | "touchMove" | "touchEnd",
  x = 0,
  y = 0,
): Promise<void> {
  await cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y }],
  });
}

test("press and hold a chip, then drag it with a finger", async ({ page }) => {
  await openStack(page);
  const cdp = await page.context().newCDPSession(page);
  const chip = await topChip(page);
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await touch(cdp, "touchStart", chip.x, chip.y);
  await page.waitForTimeout(400); // hold
  await expect(box(page).locator("[data-chip]").nth(chip.index)).toHaveAttribute("data-grabbed");
  for (let step = 1; step <= 10; step++) {
    await touch(cdp, "touchMove", chip.x - step * 12, chip.y - step * 10);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(300);
  const dragged = await chipCenter(page, chip.index);
  await touch(cdp, "touchEnd");

  // Followed the finger up and left; the page itself did not scroll.
  expect(dragged.y).toBeLessThan(chip.y - 40);
  expect(dragged.x).toBeLessThan(chip.x - 40);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await expect(box(page).locator("[data-chip]").nth(chip.index)).not.toHaveAttribute(
    "data-grabbed",
  );
});

test("a quick swipe over the chips scrolls the page instead", async ({ page }) => {
  await openStack(page);
  const cdp = await page.context().newCDPSession(page);
  const chip = await topChip(page);
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await touch(cdp, "touchStart", chip.x, chip.y);
  // Finger down = scroll up (the Stack sits at the very bottom of /about).
  for (let step = 1; step <= 10; step++) {
    await touch(cdp, "touchMove", chip.x, chip.y + step * 20);
    await page.waitForTimeout(16);
  }
  await touch(cdp, "touchEnd");

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore);
  await expect(box(page).locator("[data-chip]").nth(chip.index)).not.toHaveAttribute(
    "data-grabbed",
  );
});
