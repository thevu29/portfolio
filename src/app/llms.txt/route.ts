import { cv } from "@/content/cv";
import { llmsTxt, markdownResponse } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// llmstxt.org index for LLMs and agents (prerendered at build time).
export function GET(): Response {
  return markdownResponse(llmsTxt(cv, metadataBaseUrl), { type: "text/plain" });
}
