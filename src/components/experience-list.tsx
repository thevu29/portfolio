import Image from "next/image";
import { formatPeriod, type Education, type Experience, type Period } from "@/content/cv";
import { formatMonth, monthIndex, PRESENT } from "@/lib/date";
import { Duration } from "./duration";
import { ExpandableList } from "./expandable-list";
import { Panel } from "./primitives";

function Monogram({ name, className = "size-12" }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      aria-hidden="true"
      className={`bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-xl border font-mono text-sm ${className}`}
    >
      {letters.toUpperCase()}
    </span>
  );
}

const LOGO_SIZE = 48;

function OrgLogo({ name, logo }: { name: string; logo?: string }) {
  if (!logo) return <Monogram name={name} />;
  return (
    <Image
      src={logo}
      alt=""
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      quality={90}
      className="size-12 shrink-0 rounded-full"
    />
  );
}

/** Earliest start to latest end across a company's roles. */
function companySpan(exp: Experience): Period {
  const byMonth = (a: string, b: string) => monthIndex(a) - monthIndex(b);
  const starts = exp.roles.map((r) => r.period.start).sort(byMonth);
  const ends = exp.roles.map((r) => r.period.end);
  const end = ends.includes(PRESENT) ? PRESENT : ends.sort(byMonth)[ends.length - 1];
  return { start: starts[0], end };
}

function Dates({ period }: { period: Period }) {
  return (
    <>
      {formatMonth(period.start)} – {formatMonth(period.end)}
      <span className="text-subtle">
        <Duration start={period.start} end={period.end} prefix=" · " />
      </span>
    </>
  );
}

/**
 * LinkedIn-style experience: company header (logo, name, total time,
 * location) with its roles on a vertical timeline underneath.
 */
export function ExperienceList({ experience }: { experience: Experience[] }) {
  return (
    <Panel className="space-y-10 p-5 sm:p-7">
      {experience.map((exp) => {
        const span = companySpan(exp);
        // Ids can't contain spaces: aria-labelledby splits on whitespace.
        const headingId = `exp-${exp.company.toLowerCase().replace(/\W+/g, "-")}`;
        return (
          <article key={exp.company} aria-labelledby={headingId}>
            <header className="flex items-center gap-4">
              <OrgLogo name={exp.company} logo={exp.logo} />
              <div className="min-w-0">
                <h3 id={headingId} className="text-base font-medium">
                  {exp.url ? (
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="decoration-subtle underline-offset-4 hover:underline"
                    >
                      {exp.company}
                    </a>
                  ) : (
                    exp.company
                  )}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {exp.location}
                  <Duration start={span.start} end={span.end} prefix=" · " />
                </p>
              </div>
            </header>

            <ol className="relative mt-6 ml-6 space-y-8 border-l pl-8">
              {exp.roles.map((role, i) => (
                <li key={role.title} className="relative">
                  <span
                    aria-hidden="true"
                    className={`ring-card absolute top-1.5 -left-[37px] size-2.5 rounded-full ring-4 ${
                      i === 0 && role.period.end === PRESENT ? "bg-signal" : "bg-subtle"
                    }`}
                  />
                  <h4 className="font-medium">{role.title}</h4>
                  <p className="text-muted-foreground text-sm">{role.employmentType}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    <Dates period={role.period} />
                  </p>
                  <div className="mt-3">
                    <ExpandableList items={role.bullets} />
                  </div>
                </li>
              ))}
            </ol>
          </article>
        );
      })}
    </Panel>
  );
}

export function EducationList({ education }: { education: Education[] }) {
  return (
    <Panel className="space-y-6 p-5 sm:p-7">
      {education.map((edu) => (
        <article key={edu.school} className="flex items-center gap-4">
          <OrgLogo name={edu.school} logo={edu.logo} />
          <div className="min-w-0">
            <h3 className="font-medium">{edu.school}</h3>
            <p className="text-muted-foreground text-sm">
              {edu.degree} · GPA {edu.gpa}
            </p>
            <p className="text-subtle text-sm">
              {formatPeriod(edu.period)} · {edu.location}
            </p>
          </div>
        </article>
      ))}
    </Panel>
  );
}
