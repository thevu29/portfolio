/**
 * Contact details come from the environment (.env locally, project settings
 * on Vercel) so they can change without a code edit. Read at build time on
 * the server only: never import this into a "use client" module.
 */
export interface Contact {
  email: string;
  github: string;
  linkedin: string;
}

type Env = Record<string, string | undefined>;

const EMAIL = /^[^\s@:]+@[^\s@]+\.[^\s@]+$/;

function required(env: Env, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
}

/** An https profile URL on `host` (or a subdomain), without a trailing slash. */
function profileUrl(env: Env, name: string, host: string): string {
  const raw = required(env, name);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} is not a valid URL: "${raw}"`);
  }
  const onHost = url.hostname === host || url.hostname.endsWith(`.${host}`);
  if (url.protocol !== "https:" || !onHost || url.pathname === "/") {
    throw new Error(`${name} must be an https://${host}/… profile URL: "${raw}"`);
  }
  return url.href.replace(/\/$/, "");
}

/** Throws on a missing or malformed value so a bad deploy fails the build. */
export function parseContact(env: Env): Contact {
  const email = required(env, "CONTACT_EMAIL");
  if (!EMAIL.test(email)) throw new Error(`CONTACT_EMAIL is not a valid email: "${email}"`);
  return {
    email,
    github: profileUrl(env, "GITHUB_URL", "github.com"),
    linkedin: profileUrl(env, "LINKEDIN_URL", "linkedin.com"),
  };
}
