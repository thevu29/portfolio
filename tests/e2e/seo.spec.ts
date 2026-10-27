import { expect, test } from "@playwright/test";
import { cv } from "../../src/content/cv";

// Markdown twins, llms.txt, sitemap and robots, as crawlers and agents fetch them.
const PAGES = [
  { html: "/", md: "/index.md" },
  { html: "/projects", md: "/projects.md" },
  { html: "/about", md: "/about.md" },
  { html: "/cv", md: "/cv.md" },
] as const;

for (const { html, md } of PAGES) {
  test(`${md} serves Markdown with a canonical link to ${html}`, async ({ request }) => {
    const res = await request.get(md);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
    expect(res.headers()["link"]).toMatch(
      new RegExp(`<https?://[^>]+${html === "/" ? "/" : html}>; rel="canonical"`),
    );
    const body = await res.text();
    expect(body).toMatch(/^---\ntitle: /);
    expect(body).toMatch(/^# .+/m);
    expect(body).not.toContain(cv.profile.phone);
  });

  test(`${html} advertises its Markdown twin and canonical URL`, async ({ page }) => {
    await page.goto(html);
    const path = (selector: string) =>
      page
        .locator(selector)
        .getAttribute("href")
        .then((href) => new URL(href ?? "", "http://invalid").pathname);
    expect(await path('link[rel="alternate"][type="text/markdown"]')).toBe(md);
    expect(await path('link[rel="canonical"]')).toBe(html);
  });
}

test("a page without a twin is a 404", async ({ request }) => {
  expect((await request.get("/nope.md")).status()).toBe(404);
});

test("llms.txt is plain text and every link in it works", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("text/plain; charset=utf-8");
  const body = await res.text();
  expect(body.startsWith(`# ${cv.profile.name}\n`)).toBe(true);

  // Site links are absolute (to NEXT_PUBLIC_SITE_URL); fetch them on this server.
  const site = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)]
    .map((m) => new URL(m[1]))
    .filter((url) => !/github\.com|linkedin\.com/.test(url.hostname));
  expect(site.map((url) => url.pathname)).toEqual(
    expect.arrayContaining(["/index.md", "/projects.md", "/about.md", "/cv.md", "/llms-full.txt"]),
  );
  for (const url of site) {
    expect((await request.get(url.pathname)).status(), url.pathname).toBe(200);
  }
});

test("llms-full.txt holds every page", async ({ request }) => {
  const body = await (await request.get("/llms-full.txt")).text();
  expect(body.match(/^---\ntitle: /gm)).toHaveLength(PAGES.length);
});

test("sitemap lists the HTML pages only", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(urls).toEqual(PAGES.map((p) => p.html));
});

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toContain("Allow: /");
  expect(txt).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
});
