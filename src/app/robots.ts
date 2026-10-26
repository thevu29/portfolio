import type { MetadataRoute } from "next";
import { metadataBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", metadataBaseUrl).toString(),
  };
}
