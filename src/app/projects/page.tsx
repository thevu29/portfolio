import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { PROJECTS_COPY } from "@/content/pages";
import { HeroFrame } from "@/components/hero-frame";
import { PageContainer, PageHeader, Reveal } from "@/components/primitives";
import { ProjectCard } from "@/components/project-card";
import { SpotlightCard } from "@/components/spotlight";

export const metadata: Metadata = {
  title: "Projects",
  description: PROJECTS_COPY.metaDescription,
  alternates: { canonical: "/projects", types: { "text/markdown": "/projects.md" } },
};

export default function ProjectsPage() {
  return (
    <>
      <HeroFrame>
        <PageHeader
          eyebrow="Projects"
          title={PROJECTS_COPY.title}
          description={PROJECTS_COPY.description}
        />
      </HeroFrame>
      <PageContainer className="mt-8">
        <div className="space-y-6">
          {cv.projects.map((project) => (
            <Reveal key={project.slug}>
              <SpotlightCard>
                <ProjectCard project={project} />
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
