import { ArrowUpRightIcon } from "lucide-react";
import { formatPeriod, type Project } from "@/content/cv";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { TechChips } from "./primitives";
import { ProjectCover } from "./project-cover";

export const projectAnchor = (slug: string): string => `/projects#${slug}`;

const card =
  "group bg-card hover:border-subtle/50 rounded-3xl border p-2.5 transition-colors duration-300";

/** Home-page card: the whole card links to the project on /projects. */
export function ProjectLinkCard({ project }: { project: Project }) {
  // Name the link by its title, not the whole card's text.
  const summaryId = `${project.slug}-summary`;
  return (
    <NavLink
      href={projectAnchor(project.slug)}
      aria-label={`${project.name} — ${project.subtitle}`}
      aria-describedby={summaryId}
      className={cn(card, "flex h-full flex-col focus-visible:outline-offset-4")}
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-3">
        <h3 className="text-sm font-medium">
          {project.name}
          <span className="sr-only"> — {project.subtitle}</span>
        </h3>
        <span className="text-subtle ml-auto font-mono text-[11px]">
          {formatPeriod(project.period)}
        </span>
      </div>
      <ProjectCover project={project} />
      <div className="flex flex-1 flex-col px-2.5 pt-4 pb-2">
        <p id={summaryId} className="text-[15px] leading-snug font-medium text-balance">
          {project.description}
        </p>
        <p className="text-muted-foreground mt-2 font-mono text-xs">{project.role}</p>
        <span className="text-muted-foreground group-hover:text-foreground mt-auto inline-flex items-center gap-1 pt-4 text-sm transition-colors">
          View details
          <ArrowUpRightIcon
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </NavLink>
  );
}

/** Projects-page card: one per row, cover beside the full details. */
export function ProjectCard({ project }: { project: Project }) {
  const headingId = `${project.slug}-heading`;
  return (
    <article
      id={project.slug}
      aria-labelledby={headingId}
      className={cn(card, "grid scroll-mt-28 gap-6 md:grid-cols-[1fr_1.1fr] md:p-3")}
    >
      <div className="md:sticky md:top-24 md:self-start">
        <ProjectCover project={project} />
      </div>
      <div className="px-2.5 pb-3 md:px-2 md:py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={headingId} className="text-2xl font-medium tracking-tight">
            {project.name}{" "}
            <span className="text-muted-foreground font-normal">— {project.subtitle}</span>
          </h2>
          <p className="text-subtle font-mono text-xs">{formatPeriod(project.period)}</p>
        </div>
        <p className="text-muted-foreground mt-1 font-mono text-xs">{project.role}</p>
        <p className="mt-5 leading-relaxed text-pretty">{project.description}</p>
        <ul className="text-muted-foreground mt-4 space-y-2.5 text-sm leading-relaxed">
          {project.bullets.map((bullet) => (
            <li
              key={bullet}
              className="before:text-subtle relative pl-4 before:absolute before:left-0 before:content-['–']"
            >
              {bullet}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <TechChips items={project.stack} label={`${project.name} tech stack`} />
        </div>
      </div>
    </article>
  );
}
