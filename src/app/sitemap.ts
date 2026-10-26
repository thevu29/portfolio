import type { MetadataRoute } from "next";
import { NAV_ITEMS } from "@/lib/nav";
import { metadataBaseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_ITEMS.map(({ href }) => ({
    url: new URL(href, metadataBaseUrl).toString(),
    changeFrequency: "monthly",
    priority: href === "/" ? 1 : 0.7,
  }));
}
