// @vitest-environment node
import { extractText, getDocumentProxy } from "unpdf";
import { beforeAll, describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import { renderCvPdf } from "@/pdf/render";

type PdfDoc = Awaited<ReturnType<typeof getDocumentProxy>>;

async function linkUrls(doc: PdfDoc): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    for (const a of await page.getAnnotations()) {
      if (typeof a.url === "string") urls.push(a.url);
    }
  }
  return urls;
}

// Text extraction may split lines; compare on collapsed whitespace.
const squash = (s: string) => s.replace(/\s+/g, " ");

describe("renderCvPdf", () => {
  let buffer: Buffer;
  let text: string;
  let doc: PdfDoc;

  beforeAll(async () => {
    buffer = await renderCvPdf();
    doc = await getDocumentProxy(new Uint8Array(buffer));
    text = squash((await extractText(doc, { mergePages: true })).text);
  }, 30_000);

  it("produces a valid PDF", () => {
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("fits on two A4 pages like the Canva CV", () => {
    expect(doc.numPages).toBe(2);
  });

  it("contains the name, every company, role, project and school", () => {
    const expected = [
      "NGUYEN THE VU",
      ...cv.experience.flatMap((e) => [
        e.company.toUpperCase(),
        ...e.roles.map((r) => r.title.toUpperCase()),
      ]),
      ...cv.projects.map((p) => p.name),
      ...cv.education.map((e) => e.school.toUpperCase()),
    ];
    for (const value of expected) expect(text).toContain(value);
  });

  it("contains every bullet verbatim", () => {
    const bullets = [
      ...cv.experience.flatMap((e) => e.roles.flatMap((r) => r.bullets)),
      ...cv.projects.flatMap((p) => p.bullets),
    ];
    for (const bullet of bullets) expect(text).toContain(squash(bullet));
  });

  it("links exactly email, phone, LinkedIn, GitHub and the company site when no site URL is set", async () => {
    const urls = new Set(await linkUrls(doc));
    const expected = [
      `mailto:${cv.profile.email}`,
      `tel:${cv.profile.phone.replace(/\s/g, "")}`,
      cv.profile.linkedin,
      cv.profile.github,
      ...cv.experience.flatMap((e) => (e.url ? [e.url] : [])),
    ];
    // pdf.js may normalise URLs with a trailing slash.
    const normalise = (u: string) => u.replace(/\/$/, "");
    expect(new Set([...urls].map(normalise))).toEqual(new Set(expected.map(normalise)));
    expect(text).toContain("Portfolio");
  });

  it("links Portfolio when a site URL is given", async () => {
    const withSite = await getDocumentProxy(
      new Uint8Array(await renderCvPdf({ siteUrl: "https://thevu.dev" })),
    );
    expect(await linkUrls(withSite)).toContain("https://thevu.dev/");
  }, 30_000);
});
