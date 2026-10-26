/**
 * Validates NEXT_PUBLIC_SITE_URL. Returns undefined when unset so callers can
 * render the Portfolio entry as plain text; throws on a malformed value so a
 * bad deploy config fails the build instead of shipping broken links.
 */
export function parseSiteUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${value}"`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`NEXT_PUBLIC_SITE_URL must use http(s): "${value}"`);
  }
  return url.origin;
}

export const siteUrl = parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

const LOCAL_URL = "http://localhost:3000";

/**
 * Absolute base for metadata, sitemap and OG tags. Prefers the explicit site
 * URL, then Vercel's production domain (set on every Vercel build), so a
 * deploy without NEXT_PUBLIC_SITE_URL never ships localhost URLs.
 */
export function resolveMetadataBase(
  explicit: string | undefined,
  vercelHost: string | undefined,
): string {
  if (explicit) return explicit;
  if (vercelHost) return `https://${vercelHost}`;
  return LOCAL_URL;
}

export const metadataBaseUrl = resolveMetadataBase(
  siteUrl,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
);
