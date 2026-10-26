// Maps tech names used in src/content/cv.ts to brand icons (simple-icons).
// Server-side only: resolve here and pass plain data to client components,
// so the icon set never ships to the browser.
import {
  siCloudflare,
  siDocker,
  siExpress,
  siFlutter,
  siGit,
  siGithubactions,
  siGraphql,
  siJavascript,
  siKeycloak,
  siMariadb,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siRabbitmq,
  siReact,
  siRedis,
  siRedux,
  siSanity,
  siSocketdotio,
  siSpringboot,
  siStrapi,
  siTailwindcss,
  siTanstack,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import type { Cv } from "@/content/cv";

export interface TechIconData {
  title: string;
  /** Brand colour as #RRGGBB. */
  hex: string;
  /** SVG path on a 24×24 viewBox; absent → render a monogram. */
  path?: string;
}

export const FALLBACK_HEX = "#3F3F46";

const ICONS: Record<string, SimpleIcon> = {
  javascript: siJavascript,
  typescript: siTypescript,
  java: siOpenjdk,
  openjdk: siOpenjdk,
  postgresql: siPostgresql,
  mysql: siMysql,
  mariadb: siMariadb,
  mongodb: siMongodb,
  redis: siRedis,
  tailwindcss: siTailwindcss,
  "tailwind css": siTailwindcss,
  react: siReact,
  "next.js": siNextdotjs,
  redux: siRedux,
  "tanstack query": siTanstack,
  "node.js": siNodedotjs,
  "express.js": siExpress,
  nestjs: siNestjs,
  "spring boot": siSpringboot,
  graphql: siGraphql,
  rabbitmq: siRabbitmq,
  "socket.io": siSocketdotio,
  docker: siDocker,
  git: siGit,
  "github actions": siGithubactions,
  strapi: siStrapi,
  cloudflare: siCloudflare,
  sanity: siSanity,
  keycloak: siKeycloak,
  flutter: siFlutter,
};

export function normalizeTechName(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function resolveTech(name: string): TechIconData {
  const icon = ICONS[normalizeTechName(name)];
  return icon
    ? { title: name, hex: `#${icon.hex}`, path: icon.path }
    : { title: name, hex: FALLBACK_HEX };
}

// Groups that are tools, as opposed to practices or spoken languages.
const STACK_GROUPS = new Set([
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases & Caching",
  "Tools & DevOps",
]);

/** Deduplicated tools for the About "Stack" block. */
export function stackSkills(cv: Cv): TechIconData[] {
  const names = cv.skills.filter((g) => STACK_GROUPS.has(g.label)).flatMap((g) => g.items);
  return [...new Set(names)].map(resolveTech);
}
