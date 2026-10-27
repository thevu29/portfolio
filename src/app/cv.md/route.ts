import { cv } from "@/content/cv";
import { markdownResponse, pageMarkdown } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// Markdown twin of /cv (prerendered at build time).
export function GET(): Response {
  return markdownResponse(pageMarkdown("cv", cv, metadataBaseUrl), {
    canonical: new URL("/cv", metadataBaseUrl).toString(),
  });
}
