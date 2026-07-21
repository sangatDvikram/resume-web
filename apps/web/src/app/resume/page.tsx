import type { Metadata } from "next";
import { getResume, getProjects } from "@/lib/api";
import type { ResumeResponseDto, ProjectSummaryDto } from "@/lib/api";

// ── OG + Twitter metadata (from live resume data) ──────────────────────────────

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { profile } = await getResume();
    const title = `${profile.name} — ${profile.position}`;
    const description = truncate(
      profile.description ??
        `${profile.name}'s full resume — experience, skills, education, and patents.`,
      160
    );

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Resume",
      description: "Vikram Sangat's full resume — experience, skills, education, and patents.",
    };
  }
}

// Static at build time; revalidated on-demand when AdminJS mutates resume data.
export const revalidate = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function formatRange(start: string | null | undefined, end: string | null | undefined, isCurrent?: boolean): string {
  const s = formatDate(start);
  if (!s) return "";
  return isCurrent || !end ? `${s} – Present` : `${s} – ${formatDate(end)}`;
}

// ── Sections ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  language:  "Languages",
  framework: "Frameworks & Libraries",
  database:  "Databases",
  tool:      "Tools & Platforms",
};

const CATEGORY_ORDER = ["language", "framework", "database", "tool"] as const;

function SkillsSection({ resume }: { resume: ResumeResponseDto }) {
  const grouped = resume.skills.reduce<Record<string, typeof resume.skills>>(
    (acc, s) => { (acc[s.category] ??= []).push(s); return acc; },
    {}
  );

  return (
    <section aria-labelledby="skills-heading" className="space-y-6">
      <h2 id="skills-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Skills
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (!items?.length) return null;
          return (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <span key={s.id} className="skill-chip text-sm">{s.name}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ExperienceSection({ resume }: { resume: ResumeResponseDto }) {
  return (
    <section aria-labelledby="experience-heading" className="space-y-6">
      <h2 id="experience-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Experience
      </h2>
      <ol className="relative space-y-10 list-none p-0 m-0">
        {resume.experience.map((exp) => (
          <li key={exp.id} className="flex gap-6">
            {/* Timeline decoration */}
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className="timeline-dot" />
              <div className="flex-1 timeline-line mt-2" />
            </div>

            <div className="flex-1 pb-8 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground leading-tight">
                  {exp.title}
                </h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatRange(exp.startDate, exp.endDate, exp.isCurrent)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>

              {exp.tasks.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
                  {exp.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              )}

              {exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.skills.map((s) => (
                    <span key={s.id} className="skill-chip text-xs">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProjectsSection({ projects }: { projects: ProjectSummaryDto[] }) {
  if (!projects.length) return null;
  return (
    <section aria-labelledby="projects-heading" className="space-y-4">
      <h2 id="projects-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Projects
      </h2>
      <ul className="space-y-4 list-none p-0 m-0">
        {projects.map((p) => (
          <li key={p.id} className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={`/projects/${p.slug}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {p.title}
              </a>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatRange(p.startDate, p.endDate)}
              </span>
            </div>

            {(p.role || p.company) && (
              <p className="text-sm text-muted-foreground">
                {p.role}
                {p.role && p.company ? " · " : ""}
                {p.company}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs">
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                  GitHub
                </a>
              )}
              {p.liveDemoUrl && (
                <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                  Live Demo
                </a>
              )}
            </div>

            {p.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.skills.map((s) => (
                  <span key={s.id} className="skill-chip text-xs">{s.name}</span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EducationSection({ resume }: { resume: ResumeResponseDto }) {
  if (!resume.education.length) return null;
  return (
    <section aria-labelledby="education-heading" className="space-y-4">
      <h2 id="education-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Education
      </h2>
      <ul className="space-y-4 list-none p-0 m-0">
        {resume.education.map((edu) => (
          <li key={edu.id} className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-foreground">{edu.degree}</p>
              <p className="text-muted-foreground">{edu.university}</p>
            </div>
            <span className="text-muted-foreground whitespace-nowrap shrink-0">{edu.duration}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PatentsSection({ resume }: { resume: ResumeResponseDto }) {
  if (!resume.patents.length) return null;
  return (
    <section aria-labelledby="patents-heading" className="space-y-4">
      <h2 id="patents-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Patents
      </h2>
      <ul className="space-y-3 list-none p-0 m-0">
        {resume.patents.map((p) => (
          <li key={p.id} className="text-sm">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {p.title}
            </a>
            {p.link && (
              <span className="text-muted-foreground ml-2">{p.link}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CertificationsSection({ resume }: { resume: ResumeResponseDto }) {
  if (!resume.certifications.length && !resume.awards.length) return null;
  return (
    <section aria-labelledby="recognitions-heading" className="space-y-4">
      <h2 id="recognitions-heading" className="text-xl font-semibold tracking-tight border-b border-border pb-2">
        Certifications &amp; Awards
      </h2>
      <ul className="space-y-2 list-none p-0 m-0">
        {resume.certifications.map((c) => (
          <li key={c.id} className="flex justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{c.title}</span>
            <span className="text-muted-foreground shrink-0">{c.issuer}</span>
          </li>
        ))}
        {resume.awards.map((a) => (
          <li key={a.id} className="flex justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{a.title}</span>
            <span className="text-muted-foreground shrink-0">{a.issuer}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResumePage() {
  let resume: ResumeResponseDto | null = null;
  let projects: ProjectSummaryDto[] = [];

  try {
    resume = await getResume();
  } catch {
    resume = null;
  }

  try {
    projects = await getProjects();
  } catch {
    projects = [];
  }

  if (!resume) {
    return (
      <main className="section-container py-16 text-center text-muted-foreground">
        <p>Resume data unavailable. Please check back shortly.</p>
      </main>
    );
  }

  const { profile } = resume;

  return (
    <main className="section-container py-16">
      {/* Header */}
      <header className="mb-12 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient">
              {profile.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">{profile.position}</p>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-3 text-sm">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                {profile.email}
              </a>
            )}
            {profile.linkedInUrl && (
              <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            )}
            {resume.patents.length > 0 && (
              <a href="#patents-heading" className="text-muted-foreground hover:text-foreground transition-colors">
                Patents
              </a>
            )}
            {projects.length > 0 && (
              <a href="#projects-heading" className="text-muted-foreground hover:text-foreground transition-colors">
                Projects
              </a>
            )}
            {profile.location && (
              <span className="text-muted-foreground">{profile.location}</span>
            )}
          </div>
        </div>

        {profile.description && (
          <p className="max-w-2xl text-muted-foreground leading-relaxed">{profile.description}</p>
        )}

        {profile.yearsOfExperienceString && (
          <p className="text-sm text-muted-foreground">
            {profile.yearsOfExperienceString} years of professional experience
          </p>
        )}
      </header>

      {/* Sections */}
      <div className="space-y-12">
        <PatentsSection resume={resume} />
        <SkillsSection resume={resume} />
        <ExperienceSection resume={resume} />
        <ProjectsSection projects={projects} />
        <EducationSection resume={resume} />
        <CertificationsSection resume={resume} />
      </div>

      {/* Download hint */}
      {profile.email && (
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Want a PDF version?{" "}
            <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
              {profile.email}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
