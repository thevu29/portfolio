import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { type Cv, type Project, formatPeriod } from "@/content/cv";
import { styles } from "./styles";

// Keep a heading with at least this much of its content on the same page.
const MIN_PRESENCE_AHEAD = 40;

export interface CvDocumentProps {
  cv: Cv;
  /** Absolute portfolio URL; when absent the "Portfolio" entry is plain text. */
  siteUrl?: string;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading} minPresenceAhead={MIN_PRESENCE_AHEAD}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Header({ cv, siteUrl }: CvDocumentProps) {
  const { profile } = cv;
  return (
    <View>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.title}>{profile.title}</Text>
      <Text style={styles.contact}>
        <Link src={`mailto:${profile.email}`} style={styles.plainLink}>
          {profile.email}
        </Link>
        {" | "}
        <Link src={`tel:${profile.phone.replace(/\s/g, "")}`} style={styles.plainLink}>
          {profile.phone}
        </Link>
        {` | ${profile.location} | `}
        <Link src={profile.linkedin} style={styles.link}>
          LinkedIn
        </Link>
        {" | "}
        <Link src={profile.github} style={styles.link}>
          GitHub
        </Link>
        {" | "}
        {siteUrl ? (
          <Link src={siteUrl} style={styles.link}>
            Portfolio
          </Link>
        ) : (
          <Text style={styles.link}>Portfolio</Text>
        )}
      </Text>
      <View style={styles.rule} />
    </View>
  );
}

function ProjectEntry({ project, first }: { project: Project; first: boolean }) {
  return (
    <View style={first ? undefined : styles.entryGap}>
      <View wrap={false} minPresenceAhead={MIN_PRESENCE_AHEAD}>
        <View style={styles.row}>
          <Text style={styles.entryTitle}>{project.name}</Text>
          <Text style={styles.date}>{formatPeriod(project.period)}</Text>
        </View>
        <Text style={[styles.roleLine, styles.projectRole]}>{project.role}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.paragraph}>{project.description}</Text>
        <Bullets items={project.bullets} />
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Tech Stack:</Text> {project.stack.join(", ")}
        </Text>
      </View>
    </View>
  );
}

export function CvDocument({ cv, siteUrl }: CvDocumentProps) {
  return (
    <Document
      title={`${cv.profile.name} — CV`}
      author={cv.profile.name}
      subject={cv.profile.title}
      language="en"
    >
      <Page size="A4" style={styles.page}>
        <Header cv={cv} siteUrl={siteUrl} />

        <Section title="Summary">
          <Text style={styles.paragraph}>{cv.summary}</Text>
        </Section>

        <Section title="Experiences">
          {cv.experience.map((exp) => (
            <View key={exp.company}>
              {exp.url ? (
                <Link src={exp.url} style={[styles.company, styles.plainLink]}>
                  {exp.company}
                </Link>
              ) : (
                <Text style={styles.company}>{exp.company}</Text>
              )}
              {exp.roles.map((role, i) => (
                <View key={role.title} style={i === 0 ? undefined : styles.roleGap}>
                  <View
                    style={[styles.row, i === 0 ? styles.companyToRole : {}]}
                    wrap={false}
                    minPresenceAhead={MIN_PRESENCE_AHEAD}
                  >
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.date}>{formatPeriod(role.period)}</Text>
                  </View>
                  <View style={styles.body}>
                    <Bullets items={role.bullets} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </Section>

        <Section title="Skills">
          {cv.skills.map((group) => (
            <View key={group.label} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>{group.label}:</Text> {group.items.join(", ")}.
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Projects">
          {cv.projects.map((project, i) => (
            <ProjectEntry key={project.slug} project={project} first={i === 0} />
          ))}
        </Section>

        <Section title="Education">
          {cv.education.map((edu) => (
            <View key={edu.school} wrap={false}>
              <Text style={styles.company}>
                {edu.school} | {edu.location}
              </Text>
              <View style={[styles.row, styles.companyToRole]}>
                <Text style={styles.roleLine}>{edu.degree}</Text>
                <Text style={styles.date}>{formatPeriod(edu.period)}</Text>
              </View>
              <View style={styles.body}>
                <Bullets items={[`GPA: ${edu.gpa}`]} />
              </View>
            </View>
          ))}
        </Section>
      </Page>
    </Document>
  );
}
