import { cv } from "@/content/cv";
import { markdownResponse, pageMarkdown } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// Markdown twin of /about (prerendered at build time).
export function GET(): Response {
  return markdownResponse(pageMarkdown("about", cv, metadataBaseUrl), {
    canonical: new URL("/about", metadataBaseUrl).toString(),
  });
}
