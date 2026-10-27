import { ArrowRightIcon, DownloadIcon, MailIcon } from "lucide-react";
import type { Metadata } from "next";
import { cv, CV_PDF_FILENAME, CV_PDF_PATH } from "@/content/cv";
import { HOME_COPY } from "@/content/pages";
import { BlurText } from "@/components/blur-text";
import { ExperienceList } from "@/components/experience-list";
import { HeroFrame } from "@/components/hero-frame";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { PortraitCard } from "@/components/portrait-card";
import { PageContainer, Reveal, Rise, SectionHeading } from "@/components/primitives";
import { ProjectLinkCard } from "@/components/project-card";
import { SpotlightCard } from "@/components/spotlight";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/nav-link";

export const metadata: Metadata = {
  alternates: { canonical: "/", types: { "text/markdown": "/index.md" } },
};

const pill = "h-10 rounded-full px-5 text-sm";
const iconPill = "size-10 rounded-full";

export default function HomePage() {
  const { profile, experience, projects } = cv;

  return (
    <>
      <HeroFrame>
        <div className="grid items-center gap-12 md:grid-cols-[1.25fr_1fr]">
          <div>
            <Rise>
              <p className="text-muted-foreground">
                Hi, I&apos;m {profile.greetingName}{" "}
                <span
                  aria-hidden="true"
                  className="inline-block origin-[70%_70%] motion-safe:animate-[wave_2.4s_ease-in-out_1s_2]"
                >
                  👋
                </span>
              </p>
            </Rise>
            <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl">
              <BlurText text={HOME_COPY.headline} delay={0.1} />
            </h1>
            <Rise step={3}>
              <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed text-pretty">
                {HOME_COPY.intro}
              </p>
            </Rise>
            <Rise step={4} className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className={cn(buttonVariants(), pill)}>
                <MailIcon /> Contact
              </a>
              <NavLink
                href="/projects"
                className={cn(buttonVariants({ variant: "outline" }), pill)}
              >
                View my work <ArrowRightIcon />
              </NavLink>
              <a
                href={CV_PDF_PATH}
                download={CV_PDF_FILENAME}
                className={cn(buttonVariants({ variant: "ghost" }), pill)}
              >
                <DownloadIcon /> Download CV
              </a>
            </Rise>
          </div>
          <Rise step={2} className="flex justify-center md:justify-end">
            <PortraitCard profile={profile} />
          </Rise>
        </div>
      </HeroFrame>

      <PageContainer className="mt-24">
        <section aria-labelledby="work-heading">
          <SectionHeading
            id="work-heading"
            eyebrow={HOME_COPY.work.eyebrow}
            title={HOME_COPY.work.title}
            description={HOME_COPY.work.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Reveal key={project.slug}>
                <SpotlightCard>
                  <ProjectLinkCard project={project} />
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <NavLink href="/projects" className={cn(buttonVariants({ variant: "outline" }), pill)}>
              All projects & details <ArrowRightIcon />
            </NavLink>
          </div>
        </section>

        <section aria-labelledby="experience-heading" className="mx-auto mt-32 max-w-3xl">
          <SectionHeading
            id="experience-heading"
            eyebrow="Experience"
            title={HOME_COPY.experienceTitle}
          />
          <ExperienceList experience={experience} />
        </section>

        <section aria-labelledby="contact-heading" className="mt-32">
          <Reveal>
            <div className="bg-card relative overflow-hidden rounded-[2rem] border px-6 py-16 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="bg-foreground/5 absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full blur-3xl"
              />
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Contact
              </p>
              <h2
                id="contact-heading"
                className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl"
              >
                {HOME_COPY.contact.title}
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-md leading-relaxed">
                {HOME_COPY.contact.text}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href={`mailto:${profile.email}`} className={cn(buttonVariants(), pill)}>
                  <MailIcon /> {profile.email}
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), iconPill)}
                >
                  <GitHubIcon />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), iconPill)}
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </PageContainer>
    </>
  );
}
