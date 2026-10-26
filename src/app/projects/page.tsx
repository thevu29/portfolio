import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { HeroFrame } from "@/components/hero-frame";
import { PageContainer, PageHeader } from "@/components/primitives";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected client and product work: e-commerce, multi-project delivery, WMS and more.",
};

export default function ProjectsPage() {
  return (
    <PageTransition>
      <HeroFrame>
        <PageHeader
          eyebrow="Projects"
          title="Things I've built"
          description="Client and product work from the last two years. Most of it is under NDA, so the details stay at the level of what I built and the stack I used."
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
    </PageTransition>
  );
}
