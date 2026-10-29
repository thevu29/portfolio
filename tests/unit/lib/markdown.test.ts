import { describe, expect, it } from "vitest";
import { cv, CV_PDF_PATH, type Cv } from "@/content/cv";
import {
  llmsFullTxt,
  llmsTxt,
  MARKDOWN_PAGES,
  markdownPath,
  markdownResponse,
  pageMarkdown,
  periodText,
  type MarkdownPage,
} from "@/lib/markdown";

const BASE = "https://example.dev";
const PAGES = MARKDOWN_PAGES.map((p) => p.page);

/** YAML frontmatter fields (values are JSON strings). */
function frontmatter(md: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(md);
  if (!match) throw new Error("no frontmatter");
  return Object.fromEntries(
    match[1].split("\n").map((line) => {
      const at = line.indexOf(": ");
      return [line.slice(0, at), JSON.parse(line.slice(at + 2)) as string];
    }),
  );
}

const links = (md: string) =>
  [...md.matchAll(/\]\(([^)]+)\)|<(https?:[^>]+)>/g)].map((m) => m[1] ?? m[2]);

describe("markdownPath", () => {
  it("maps home to /index.md", () => {
    expect(markdownPath("/")).toBe("/index.md");
  });

  it("appends .md to other pages", () => {
    expect(markdownPath("/about")).toBe("/about.md");
    expect(markdownPath("/projects")).toBe("/projects.md");
  });
});

describe("periodText", () => {
  it("formats months and an ongoing end", () => {
    expect(periodText({ start: "09/2025", end: "present" })).toBe("Sep 2025 – Present");
  });

  it("keeps bare years", () => {
    expect(periodText({ start: "2021", end: "2025" })).toBe("2021 – 2025");
  });
});

describe("pageMarkdown", () => {
  it.each(PAGES)("%s starts with frontmatter pointing at the HTML page", (page) => {
    const { href } = MARKDOWN_PAGES.find((p) => p.page === page)!;
    const meta = frontmatter(pageMarkdown(page, cv, BASE));
    expect(meta.url).toBe(new URL(href, BASE).toString());
    expect(meta.title).toContain(cv.profile.name);
    expect(meta.description).not.toHaveLength(0);
  });

  it.each(PAGES)("%s has exactly one h1", (page) => {
    expect(pageMarkdown(page, cv, BASE).match(/^# /gm)).toHaveLength(1);
  });

  it.each(PAGES)("%s uses only absolute links", (page) => {
    for (const link of links(pageMarkdown(page, cv, BASE))) {
      expect(link).toMatch(/^(https?:|mailto:)/);
    }
  });

  it.each(PAGES)("%s leaves the phone number out", (page) => {
    expect(pageMarkdown(page, cv, BASE)).not.toContain(cv.profile.phone);
  });

  it("projects lists every project with its stack", () => {
    const md = pageMarkdown("projects", cv, BASE);
    for (const project of cv.projects) {
      expect(md).toContain(`## ${project.name}`);
      expect(md).toContain(`Tech stack: ${project.stack.join(", ")}`);
    }
  });

  it("home links each project to its anchor on /projects", () => {
    const md = pageMarkdown("index", cv, BASE);
    for (const project of cv.projects) {
      expect(md).toContain(`(${BASE}/projects#${project.slug})`);
    }
  });

  it("cv holds every role, skill group and school, plus the PDF link", () => {
    const md = pageMarkdown("cv", cv, BASE);
    for (const role of cv.experience.flatMap((e) => e.roles)) expect(md).toContain(role.title);
    for (const group of cv.skills) expect(md).toContain(`**${group.label}:**`);
    for (const edu of cv.education) expect(md).toContain(edu.school);
    expect(md).toContain(new URL(CV_PDF_PATH, BASE).toString());
  });

  it("about lists what I do", () => {
    const md = pageMarkdown("about", cv, BASE);
    for (const item of cv.capabilities) expect(md).toContain(`- ${item}`);
  });

  it("escapes quotes in frontmatter values", () => {
    const quoted: Cv = { ...cv, profile: { ...cv.profile, name: 'Vu "The" Nguyen' } };
    expect(frontmatter(pageMarkdown("about", quoted, BASE)).title).toBe('About — Vu "The" Nguyen');
  });

  it("throws on an unknown page", () => {
    expect(() => pageMarkdown("blog" as MarkdownPage, cv, BASE)).toThrow(/Unknown markdown page/);
  });
});

describe("llmsTxt", () => {
  const txt = llmsTxt(cv, BASE);

  it("follows the llms.txt shape: h1, summary quote, link sections", () => {
    expect(txt.startsWith(`# ${cv.profile.name}\n\n> `)).toBe(true);
    expect(txt).toContain("\n## Pages\n");
    expect(txt).toContain("\n## Optional\n");
  });

  it("links every Markdown page", () => {
    for (const { label, href } of MARKDOWN_PAGES) {
      expect(txt).toContain(`- [${label}](${BASE}${markdownPath(href)}): `);
    }
  });

  it("links the full file and the PDF", () => {
    expect(txt).toContain(`(${BASE}/llms-full.txt)`);
    expect(txt).toContain(`(${BASE}${CV_PDF_PATH})`);
  });
});

describe("llmsFullTxt", () => {
  it("holds every page in nav order", () => {
    const full = llmsFullTxt(cv, BASE);
    const positions = PAGES.map((page) => full.indexOf(pageMarkdown(page, cv, BASE)));
    expect(positions.every((at) => at >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

describe("markdownResponse", () => {
  it("serves Markdown as UTF-8 by default", async () => {
    const res = markdownResponse("# Hi");
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.has("Link")).toBe(false);
    expect(await res.text()).toBe("# Hi");
  });

  it("takes another type and a canonical link", () => {
    const res = markdownResponse("x", { type: "text/plain", canonical: `${BASE}/about` });
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("Link")).toBe(`<${BASE}/about>; rel="canonical"`);
  });
});
