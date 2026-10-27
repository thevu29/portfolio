import { cv } from "@/content/cv";
import { markdownResponse, pageMarkdown } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// Markdown twin of / (prerendered at build time).
export function GET(): Response {
  return markdownResponse(pageMarkdown("index", cv, metadataBaseUrl), {
    canonical: new URL("/", metadataBaseUrl).toString(),
  });
}
