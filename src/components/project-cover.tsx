import Image from "next/image";
import type { Project } from "@/content/cv";

const MAX_STACK = 4;

/**
 * Cover for project cards. Uses `project.image` when provided; otherwise a
 * typographic cover (NDA work): dark grid panel with the project name and a
 * short stack line. Always dark, like a screenshot, in both themes.
 */
export function ProjectCover({ project }: { project: Project }) {
  if (project.image) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border">
        <Image
          src={project.image}
          alt={`${project.name} — ${project.subtitle}`}
          fill
          sizes="(min-width: 640px) 480px, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
    );
  }

  const stack = project.stack.slice(0, MAX_STACK).join(" · ");

  return (
    <div
      aria-hidden="true"
      className="bg-grid relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-950 text-white"
    >
      <div className="absolute -top-1/2 left-1/2 h-full w-3/4 -translate-x-1/2 rounded-full bg-white/10 blur-3xl transition-transform duration-700 ease-out group-hover:scale-125 motion-reduce:transition-none" />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-wide text-white/40">{stack}</p>
        <div className="transition-transform duration-500 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
          <p className="font-mono text-[11px] tracking-wide text-white/50 uppercase">
            {project.subtitle}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</p>
        </div>
      </div>
    </div>
  );
}
