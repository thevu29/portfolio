import { cv } from "@/content/cv";
import { markdownResponse, pageMarkdown } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// Markdown twin of /projects (prerendered at build time).
export function GET(): Response {
  return markdownResponse(pageMarkdown("projects", cv, metadataBaseUrl), {
    canonical: new URL("/projects", metadataBaseUrl).toString(),
  });
}
