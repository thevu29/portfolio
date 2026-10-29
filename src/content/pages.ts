// Page copy that is not CV data, shared by the HTML pages and their Markdown
// twins (/index.md, /projects.md, /about.md, /cv.md) so the two never drift.

import { cv } from "./cv";

const { profile } = cv;

/** Meta description of the site (and the home page). */
export const SITE_DESCRIPTION = `${profile.title} building web applications end to end with React, Next.js and NestJS.`;
export const ABOUT_DESCRIPTION = `About ${profile.name}: background, experience, education and stack.`;
export const CV_DESCRIPTION = `CV of ${profile.name}, ${profile.title}.`;

export const HOME_COPY = {
  headline: "Software engineer building reliable web products.",
  intro:
    "Full-stack with React and Next.js up front, NestJS and Spring Boot services, queues and caches behind them, and a bias for code that stays easy to change.",
  work: {
    eyebrow: "Selected work",
    title: "Things I've shipped",
    description:
      "Client and product work from the last two years: e-commerce, multi-site delivery, warehouse operations and real-time apps.",
  },
  experienceTitle: "Where I've worked",
  contact: {
    title: "Let's build something.",
    text: "Open to software engineering roles and interesting projects. Email is the fastest way to reach me.",
  },
} as const;

export const PROJECTS_COPY = {
  title: "Things I've built",
  description:
    "Client and product work from the last two years. Most of it is under NDA, so the details stay at the level of what I built and the stack I used.",
  metaDescription:
    "Selected client and product work: e-commerce, multi-project delivery, WMS and more.",
} as const;
