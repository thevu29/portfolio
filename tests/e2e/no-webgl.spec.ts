import { expect, test } from "@playwright/test";

// launchOptions forces a new browser, so it must be set at file level.
test.use({ launchOptions: { args: ["--disable-webgl", "--disable-3d-apis"] } });

test("hero light rays fall back to a CSS gradient without WebGL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-rays]").first()).toHaveAttribute("data-rays", "fallback");
  await expect(page.locator(".rays-fallback").first()).toBeAttached();
});
