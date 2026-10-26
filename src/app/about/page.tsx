import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { EducationList, ExperienceList } from "@/components/experience-list";
import { HeroFrame } from "@/components/hero-frame";
import { ContactLinks, PageContainer, PageHeader, Panel, Section } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { StackPhysics } from "@/components/stack-physics";
import { Badge } from "@/components/ui/badge";
import { stackSkills } from "@/lib/tech";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "About",
  description: `About ${cv.profile.name}: background, experience, education and stack.`,
};

export default function AboutPage() {
  const { profile, summary, experience, education, capabilities } = cv;

  return (
    <PageTransition>
      <HeroFrame>
        <PageHeader
          eyebrow="About"
          title={`Hello, I'm ${profile.greetingName}.`}
          description={`${profile.title} based in ${profile.location}.`}
        />
      </HeroFrame>

      <PageContainer className="mt-8 max-w-3xl">
        <Reveal>
          <Panel className="p-6 sm:p-10">
            <p className="text-lg leading-relaxed text-pretty">{summary}</p>
            <ContactLinks profile={profile} className="mt-8" />
          </Panel>
        </Reveal>

        <div className="mt-20">
          <Section index="01" title="Experience">
            <Reveal>
              <ExperienceList experience={experience} />
            </Reveal>
          </Section>

          <Section index="02" title="Education">
            <Reveal>
              <EducationList education={education} />
            </Reveal>
          </Section>

          <Section index="03" title="What I do">
            <Reveal>
              <Panel className="p-4">
                <ul className="flex flex-wrap gap-2">
                  {capabilities.map((item) => (
                    <li key={item}>
                      <Badge
                        variant="secondary"
                        className="h-8 rounded-full px-3.5 text-sm font-normal"
                      >
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          </Section>

          <Section index="04" title="Stack">
            <Reveal>
              <StackPhysics items={stackSkills(cv)} />
            </Reveal>
            <p className="text-subtle mt-3 text-center font-mono text-xs">
              Drag the chips around · ↻ to drop them again
            </p>
          </Section>
        </div>
      </PageContainer>
    </PageTransition>
  );
}
