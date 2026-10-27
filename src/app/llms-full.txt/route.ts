import { cv } from "@/content/cv";
import { llmsFullTxt, markdownResponse } from "@/lib/markdown";
import { metadataBaseUrl } from "@/lib/site";

// Every Markdown page in one file (prerendered at build time).
export function GET(): Response {
  return markdownResponse(llmsFullTxt(cv, metadataBaseUrl), { type: "text/plain" });
}
