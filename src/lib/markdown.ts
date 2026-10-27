// Markdown twins of the HTML pages (/index.md, /projects.md, /about.md,
// /cv.md) and the llms.txt files, for LLMs and agents (llmstxt.org). Built
// from the same data as the pages: cv.ts and content/pages.ts. The phone
// number stays out, as on the /cv page.

import { CV_PDF_FILENAME, CV_PDF_PATH, type Cv, type Period, type Project } from "@/content/cv";
import {
  ABOUT_DESCRIPTION,
  CV_DESCRIPTION,
  HOME_COPY,
  PROJECTS_COPY,
  SITE_DESCRIPTION,
} from "@/content/pages";
import { formatMonth } from "@/lib/date";
import { stackSkills } from "@/lib/tech";

export type MarkdownPage = "index" | "projects" | "about" | "cv";

interface PageInfo {
  page: MarkdownPage;
  /** Path of the HTML page. */
  href: string;
  label: string;
  /** One line for llms.txt. */
  summary: string;
}

/** In nav order. */
export const MARKDOWN_PAGES: readonly PageInfo[] = [
  {
    page: "index",
    href: "/",
    label: "Home",
    summary: "Overview, selected work, experience and contact.",
  },
  {
    page: "projects",
    href: "/projects",
    label: "Projects",
    summary: "Client and product projects with role, period, highlights and tech stack.",
  },
  {
    page: "about",
    href: "/about",
    label: "About",
    summary: "Background, experience, education, what I do and my stack.",
  },
  {
    page: "cv",
    href: "/cv",
    label: "CV",
    summary: "Full CV: summary, experience, projects, skills and education.",
  },
];

/** "/" → "/index.md", "/about" → "/about.md". */
export function markdownPath(href: string): string {
  return href === "/" ? "/index.md" : `${href}.md`;
}

const abs = (path: string, base: string) => new URL(path, base).toString();

/** "09/2025"–"present" → "Sep 2025 – Present". */
export function periodText({ start, end }: Period): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

function frontmatter(title: string, description: string, url: string): string {
  // JSON strings are valid YAML double-quoted scalars.
  const field = (key: string, value: string) => `${key}: ${JSON.stringify(value)}`;
  return [
    "---",
    field("title", title),
    field("description", description),
    field("url", url),
    "---",
  ].join("\n");
}

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

function contact(cv: Cv, base: string): string {
  const { profile } = cv;
  return list([
    `Email: [${profile.email}](mailto:${profile.email})`,
    `LinkedIn: <${profile.linkedin}>`,
    `GitHub: <${profile.github}>`,
    `Location: ${profile.location}`,
    `CV (PDF): [${CV_PDF_FILENAME}](${abs(CV_PDF_PATH, base)})`,
  ]);
}

function experience(cv: Cv, heading: string): string {
  return [
    `${heading} Experience`,
    ...cv.experience.flatMap((exp) => [
      `${heading}# ${exp.url ? `[${exp.company}](${exp.url})` : exp.company}`,
      exp.location,
      ...exp.roles.flatMap((role) => [
        `${heading}## ${role.title}`,
        `${role.employmentType} · ${periodText(role.period)}`,
        list(role.bullets),
      ]),
    ]),
  ].join("\n\n");
}

function project(p: Project, heading: string): string {
  return [
    `${heading} ${p.name} — ${p.subtitle}`,
    `${p.role} · ${periodText(p.period)}`,
    p.description,
    list(p.bullets),
    `Tech stack: ${p.stack.join(", ")}`,
  ].join("\n\n");
}

function education(cv: Cv, heading: string): string {
  return [
    `${heading} Education`,
    ...cv.education.map((edu) =>
      [
        `${heading}# ${edu.school}`,
        `${edu.degree} · GPA ${edu.gpa} · ${edu.location} · ${periodText(edu.period)}`,
      ].join("\n\n"),
    ),
  ].join("\n\n");
}

function home(cv: Cv, base: string): string {
  const { profile, projects } = cv;
  return [
    `# ${HOME_COPY.headline}`,
    `Hi, I'm ${profile.greetingName}: ${profile.name}, ${profile.title} in ${profile.location}. ${HOME_COPY.intro}`,
    `## ${HOME_COPY.work.title}`,
    HOME_COPY.work.description,
    list(
      projects.map(
        (p) => `[${p.name} — ${p.subtitle}](${abs(`/projects#${p.slug}`, base)}): ${p.description}`,
      ),
    ),
    `More detail: [Projects](${abs("/projects.md", base)}).`,
    experience(cv, "##"),
    `## ${HOME_COPY.contact.title}`,
    HOME_COPY.contact.text,
    contact(cv, base),
  ].join("\n\n");
}

function projectsPage(cv: Cv): string {
  return [
    `# ${PROJECTS_COPY.title}`,
    PROJECTS_COPY.description,
    ...cv.projects.map((p) => project(p, "##")),
  ].join("\n\n");
}

function about(cv: Cv, base: string): string {
  const { profile } = cv;
  return [
    `# Hello, I'm ${profile.greetingName}.`,
    `${profile.title} based in ${profile.location}.`,
    cv.summary,
    contact(cv, base),
    experience(cv, "##"),
    education(cv, "##"),
    "## What I do",
    list(cv.capabilities),
    "## Stack",
    stackSkills(cv)
      .map((tech) => tech.title)
      .join(", "),
  ].join("\n\n");
}

function cvPage(cv: Cv, base: string): string {
  const { profile } = cv;
  return [
    `# ${profile.name}`,
    profile.title,
    contact(cv, base),
    "## Summary",
    cv.summary,
    experience(cv, "##"),
    "## Projects",
    ...cv.projects.map((p) => project(p, "###")),
    "## Skills",
    list(cv.skills.map((group) => `**${group.label}:** ${group.items.join(", ")}`)),
    education(cv, "##"),
  ].join("\n\n");
}

function pageInfo(page: MarkdownPage): PageInfo {
  const info = MARKDOWN_PAGES.find((p) => p.page === page);
  if (!info) throw new Error(`Unknown markdown page "${page}"`);
  return info;
}

const DESCRIPTIONS: Record<MarkdownPage, string> = {
  index: SITE_DESCRIPTION,
  projects: PROJECTS_COPY.metaDescription,
  about: ABOUT_DESCRIPTION,
  cv: CV_DESCRIPTION,
};

/** A page as Markdown: YAML frontmatter, then the page content. */
export function pageMarkdown(page: MarkdownPage, cv: Cv, base: string): string {
  const { href, label } = pageInfo(page);
  const title =
    page === "index" ? `${cv.profile.name} — ${cv.profile.title}` : `${label} — ${cv.profile.name}`;
  const body = { index: home, projects: projectsPage, about, cv: cvPage }[page](cv, base);
  return `${frontmatter(title, DESCRIPTIONS[page], abs(href, base))}\n\n${body}\n`;
}

/** /llms.txt: what the site is, and where the Markdown pages are. */
export function llmsTxt(cv: Cv, base: string): string {
  const { profile } = cv;
  return (
    [
      `# ${profile.name}`,
      `> ${profile.name}, based in ${profile.location}. ${SITE_DESCRIPTION}`,
      cv.summary,
      "## Pages",
      list(
        MARKDOWN_PAGES.map(
          ({ label, href, summary }) => `[${label}](${abs(markdownPath(href), base)}): ${summary}`,
        ),
      ),
      "## Optional",
      list([
        `[Everything in one file](${abs("/llms-full.txt", base)}): all pages above as one Markdown document.`,
        `[CV (PDF)](${abs(CV_PDF_PATH, base)}): the downloadable two-page CV.`,
        `[GitHub](${profile.github})`,
        `[LinkedIn](${profile.linkedin})`,
      ]),
    ].join("\n\n") + "\n"
  );
}

/** /llms-full.txt: every Markdown page, in nav order. */
export function llmsFullTxt(cv: Cv, base: string): string {
  return MARKDOWN_PAGES.map(({ page }) => pageMarkdown(page, cv, base)).join("\n");
}

/**
 * Response for a Markdown/text twin. `canonical` (the HTML page) goes in a
 * Link header so search engines index the HTML page, not its twin.
 */
export function markdownResponse(
  body: string,
  { type = "text/markdown", canonical }: { type?: string; canonical?: string } = {},
): Response {
  const headers = new Headers({ "Content-Type": `${type}; charset=utf-8` });
  if (canonical) headers.set("Link", `<${canonical}>; rel="canonical"`);
  return new Response(body, { headers });
}
