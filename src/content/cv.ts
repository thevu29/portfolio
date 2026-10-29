// Single source of truth for the CV: the /cv page, the generated PDF,
// /projects, /about and the home page all read from here.
// Text mirrors the Canva CV (design DAGIXn6uxjY) verbatim.

import { parseContact } from "@/lib/contact";

export type Period = { start: string; end: string };

export type Role = {
  title: string;
  /** LinkedIn-style employment type, e.g. "Full-time", "Internship". */
  employmentType: string;
  period: Period;
  bullets: string[];
};

export type Experience = {
  company: string;
  location: string;
  /** Company logo under /public; falls back to a monogram. */
  logo?: string;
  url?: string;
  roles: Role[];
};

export type Project = {
  slug: string;
  name: string;
  role: string;
  period: Period;
  description: string;
  bullets: string[];
  stack: string[];
  /** Optional cover screenshot under /public; falls back to a typographic cover. */
  image?: string;
};

export type SkillGroup = { label: string; items: string[] };

export type Education = {
  school: string;
  location: string;
  /** School logo under /public; falls back to a monogram. */
  logo?: string;
  degree: string;
  period: Period;
  gpa: string;
};

export type Profile = {
  name: string;
  /** Short name for friendly copy ("Hi, I'm Vu"). */
  greetingName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  /** Path under /public, e.g. "/avatar.png". Falls back to a monogram. */
  avatar?: string;
};

export type Cv = {
  profile: Profile;
  summary: string;
  experience: Experience[];
  skills: SkillGroup[];
  /** "What I do" chips on the About page (not part of the PDF). */
  capabilities: string[];
  projects: Project[];
  education: Education[];
};

import { PRESENT } from "@/lib/date";

export { PRESENT };

// Email, GitHub and LinkedIn come from env (see .env.example).
const contact = parseContact(process.env);

export const cv: Cv = {
  profile: {
    name: "Nguyen The Vu",
    greetingName: "Vu",
    title: "Software Engineer",
    email: contact.email,
    phone: "+84 976 124 506",
    location: "Ho Chi Minh City",
    linkedin: contact.linkedin,
    github: contact.github,
    avatar: "/avatar.png",
  },
  summary:
    "Software Engineer with 2 years of professional experience in building and maintaining web applications. Proficient in developing end-to-end solutions, with a strong focus on code quality, maintainability, and performance. Eager to contribute to impactful projects while continuously improving technical expertise and delivering scalable software solutions.",
  experience: [
    {
      company: "Golden Owl Solutions",
      location: "Ho Chi Minh City",
      logo: "/logos/golden-owl.png",
      url: "https://goldenowl.asia",
      roles: [
        {
          title: "Software Engineer",
          employmentType: "Full-time",
          period: { start: "09/2025", end: PRESENT },
          bullets: [
            "Built and maintained full-stack features end to end with React/Next.js and NestJS, developing and integrating RESTful and GraphQL APIs across multiple projects.",
            "Implemented backend business logic and data access on PostgreSQL, MongoDB, and MariaDB, using Redis caching to reduce database load and speed up responses.",
            "Developed and maintained services in CQRS-based microservices architectures, separating read and write models to keep business logic modular and maintainable.",
            "Built asynchronous messaging between services with RabbitMQ to decouple workloads, and shipped changes through automated CI/CD pipelines.",
            "Troubleshot and resolved bugs across frontend and backend components, tracing issues to their root cause before applying fixes.",
            "Used AI-assisted tools to speed up code reviews and test generation, reviewing and validating every AI-generated suggestion and test before merging.",
          ],
        },
        {
          title: "Software Engineer Intern",
          employmentType: "Internship",
          period: { start: "03/2025", end: "08/2025" },
          bullets: [
            "Developed features for the company's product with React/Next.js and NestJS, backed by PostgreSQL, MongoDB, and Redis.",
            "Built and integrated RESTful APIs connecting frontend features with backend services.",
            "Wrote unit, integration, and end-to-end (E2E) tests to validate application behavior and catch regressions early.",
            "Worked in Agile/Scrum sprints (planning, daily stand-ups), followed GitFlow, and took part in pull request reviews.",
          ],
        },
      ],
    },
  ],
  skills: [
    { label: "Programming Languages", items: ["JavaScript", "TypeScript", "Java", "SQL"] },
    {
      label: "Frontend",
      items: ["TailwindCSS", "React", "Next.js", "Redux", "Zustand", "TanStack Query"],
    },
    {
      label: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "NestJS",
        "Spring Boot",
        "RESTful APIs",
        "GraphQL",
        "RabbitMQ",
        "Socket.IO",
      ],
    },
    {
      label: "Databases & Caching",
      items: ["PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis"],
    },
    {
      label: "Architecture & Practices",
      items: ["Microservices", "CQRS", "Unit Testing", "Integration Testing", "E2E Testing"],
    },
    { label: "Tools & DevOps", items: ["Git", "Docker", "GitHub Actions (CI/CD)"] },
    { label: "Languages", items: ["English (TOEIC 815)"] },
  ],
  capabilities: [
    "Full-stack web apps",
    "Backend & APIs",
    "Real-time features",
    "Event-driven workflows",
    "Caching & performance",
    "Microservices & CQRS",
    "Testing & code quality",
    "CI/CD",
  ],
  projects: [
    {
      slug: "ecommerce",
      name: "E-commerce Platform",
      role: "Full-Stack Developer",
      period: { start: "10/2026", end: PRESENT },
      description: "An e-commerce platform for luggage and travel products.",
      bullets: [
        "Built responsive storefront pages from Figma designs with Next.js.",
        "Developed backend features and e-commerce business logic with Spring Boot.",
        "Integrated Elasticsearch to deliver fast, typo-tolerant product search.",
        "Cached shopping carts in Redis and used idempotency to handle race conditions when only one unit of a product is left in stock.",
      ],
      stack: [
        "Next.js",
        "React",
        "TailwindCSS",
        "Zustand",
        "TanStack Query",
        "Spring Boot",
        "Elasticsearch",
        "RabbitMQ",
        "Socket.IO",
        "Redis",
        "PostgreSQL",
        "Cloudflare",
        "AWS",
      ],
    },
    {
      slug: "insurance-real-estate",
      name: "Insurance & Real Estate Platforms",
      role: "Full-Stack Developer",
      period: { start: "03/2026", end: PRESENT },
      description:
        "Developed and delivered websites and web applications for a Swiss business group operating across insurance, real estate, and related services, from initial project setup to client delivery.",
      bullets: [
        "Built responsive landing pages from Figma designs on Sanity CMS so content can be updated without code changes, and optimized SEO / GEO.",
        "Developed full-stack web applications, including dashboards, back-office systems, and client portals, using React and NestJS.",
        "Implemented real-time chat and instant notifications using Socket.IO and Server-Sent Events (SSE).",
        "Offloaded long-running tasks to background jobs and event-driven workflows (BullMQ, RabbitMQ) to keep APIs responsive; used Redis for caching and rate limiting.",
        "Configured Cloudflare security rules to block malicious traffic before it reaches the applications.",
      ],
      stack: [
        "React",
        "Next.js",
        "TailwindCSS",
        "Zustand",
        "TanStack Query",
        "NestJS",
        "Socket.IO",
        "Sanity",
        "BullMQ",
        "Redis",
        "RabbitMQ",
        "Resend",
        "Supabase",
        "Cloudflare",
        "Railway",
        "GitHub Actions",
        "PostgreSQL",
        "MariaDB",
      ],
    },
    {
      slug: "wms",
      name: "Warehouse Management System",
      role: "Full-Stack Developer",
      period: { start: "12/2025", end: "02/2026" },
      description:
        "A web-based warehouse management system for managing warehouse operations and automated workflows.",
      bullets: [
        "Built and improved React interfaces for day-to-day warehouse operations.",
        "Developed and maintained Spring Boot APIs for warehouse business processes.",
        "Investigated, debugged, and resolved application issues across frontend and backend components.",
        "Continuously resolved SonarQube issues during development, raising code quality and maintainability.",
      ],
      stack: ["React", "TailwindCSS", "Spring Boot", "Keycloak", "RabbitMQ", "PostgreSQL"],
    },
    {
      slug: "dating-app",
      name: "Dating Application",
      role: "Backend Developer",
      period: { start: "06/2025", end: "10/2025" },
      description:
        "A dating application with real-time communication and an analytics dashboard for monitoring traffic, revenue, and user activity.",
      bullets: [
        "Developed and maintained the NestJS and GraphQL backend behind the app's core features.",
        "Resolved N+1 query issues in GraphQL resolvers, significantly reducing API latency and eliminating previously slow responses.",
        "Implemented Redis-based rate limiting to protect APIs from abuse and excessive traffic.",
        "Built real-time chat with Socket.IO.",
        "Refactored existing code to improve maintainability and performance.",
        "Built a React analytics dashboard giving Product Owners and Marketing visibility into traffic, revenue, and user metrics.",
      ],
      stack: [
        "NestJS",
        "GraphQL",
        "PostgreSQL",
        "Redis",
        "Socket.IO",
        "AWS S3",
        "React",
        "Next.js",
        "TailwindCSS",
        "Flutter",
      ],
    },
  ],
  education: [
    {
      school: "Sai Gon University",
      location: "Ho Chi Minh City",
      logo: "/logos/sgu.png",
      degree: "Software Engineering",
      period: { start: "2021", end: "2025" },
      gpa: "3.69/4.0 (8.73/10)",
    },
  ],
};

export function formatPeriod({ start, end }: Period): string {
  return `${start} - ${end}`;
}

export const CV_PDF_FILENAME = "CV_NguyenTheVu.pdf";
export const CV_PDF_PATH = `/${CV_PDF_FILENAME}`;
