import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";
import { cv, CV_PDF_FILENAME, CV_PDF_PATH, formatPeriod } from "@/content/cv";
import { CV_DESCRIPTION } from "@/content/pages";
import { HeroFrame } from "@/components/hero-frame";
import { PageContainer, Reveal, Rise, Section, TechChips } from "@/components/primitives";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CV",
  description: CV_DESCRIPTION,
  alternates: { canonical: "/cv", types: { "text/markdown": "/cv.md" } },
};

const link =
  "underline decoration-subtle underline-offset-4 transition-colors hover:decoration-foreground";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="text-muted-foreground mt-3 space-y-2 leading-relaxed">
      {items.map((item) => (
        <li
          key={item}
          className="before:text-subtle relative pl-4 before:absolute before:left-0 before:content-['–']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function EntryHeader({
  title,
  period,
  children,
}: {
  title: string;
  period: string;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-medium tracking-tight">{title}</h3>
        <p className="text-subtle font-mono text-xs">{period}</p>
      </div>
      {children && <div className="text-muted-foreground mt-1 text-sm">{children}</div>}
    </header>
  );
}

export default function CvPage() {
  const { profile, summary, experience, projects, skills, education } = cv;

  return (
    <>
      <HeroFrame>
        <div className="mx-auto flex max-w-3xl flex-wrap items-end justify-between gap-6">
          <div>
            <Rise>
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Curriculum Vitae
              </p>
            </Rise>
            <Rise step={1}>
              <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                {profile.name}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">{profile.title}</p>
            </Rise>
            <Rise step={2}>
              <ul className="text-muted-foreground mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <li>
                  <a href={`mailto:${profile.email}`} className={link}>
                    {profile.email}
                  </a>
                </li>
                <li>{profile.location}</li>
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </Rise>
          </div>
          <Rise step={3}>
            <a
              href={CV_PDF_PATH}
              download={CV_PDF_FILENAME}
              className={cn(buttonVariants(), "h-10 rounded-full px-5 text-sm")}
            >
              <DownloadIcon /> Download PDF
            </a>
          </Rise>
        </div>
      </HeroFrame>

      <PageContainer className="mt-8 max-w-3xl">
        <Section index="01" title="Summary">
          <Reveal>
            <p className="text-lg leading-relaxed text-pretty">{summary}</p>
          </Reveal>
        </Section>

        <Section index="02" title="Experience">
          {experience.map((exp) => (
            <div key={exp.company} className="space-y-10">
              {exp.roles.map((role) => (
                <Reveal key={role.title}>
                  <article>
                    <EntryHeader title={role.title} period={formatPeriod(role.period)}>
                      {exp.url ? (
                        <a
                          href={exp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={link}
                        >
                          {exp.company}
                        </a>
                      ) : (
                        exp.company
                      )}
                    </EntryHeader>
                    <Bullets items={role.bullets} />
                  </article>
                </Reveal>
              ))}
            </div>
          ))}
        </Section>

        <Section index="03" title="Projects">
          <div className="space-y-12">
            {projects.map((project) => (
              <Reveal key={project.slug}>
                <article>
                  <EntryHeader title={project.name} period={formatPeriod(project.period)}>
                    {project.role}
                  </EntryHeader>
                  <p className="mt-3 leading-relaxed">{project.description}</p>
                  <Bullets items={project.bullets} />
                  <div className="mt-4">
                    <TechChips items={project.stack} label={`${project.name} tech stack`} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section index="04" title="Skills">
          <dl className="space-y-5">
            {skills.map((group) => (
              <Reveal key={group.label} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="text-muted-foreground pt-0.5 text-sm">{group.label}</dt>
                <dd>
                  <TechChips items={group.items} label={group.label} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </Section>

        <Section index="05" title="Education">
          {education.map((edu) => (
            <Reveal key={edu.school}>
              <article>
                <EntryHeader title={edu.school} period={formatPeriod(edu.period)}>
                  {edu.degree} · GPA {edu.gpa} · {edu.location}
                </EntryHeader>
              </article>
            </Reveal>
          ))}
        </Section>
      </PageContainer>
    </>
  );
}
