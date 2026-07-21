import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects, getProject } from "@/lib/api";
import type { ProjectDetailDto } from "@/lib/api";
import { ProjectCarousel } from "../ProjectCarousel";
import { VideoSection } from "../VideoEmbed";

// ISR: revalidate at most once per minute; on-demand via /api/revalidate
export const revalidate = 60;

// ── SSG: pre-render all published slugs at build time ─────────────────────────
export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// ── OG + JSON-LD metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProject(slug);
    const cover = project.media[0]?.url ?? undefined;
    return {
      title: project.title,
      description: project.role ?? undefined,
      openGraph: {
        title: project.title,
        description: project.role ?? undefined,
        type: "article",
        ...(cover && { images: [{ url: cover, alt: project.title }] }),
      },
      twitter: {
        card: cover ? "summary_large_image" : "summary",
        title: project.title,
        description: project.role ?? undefined,
        ...(cover && { images: [cover] }),
      },
    };
  } catch {
    return { title: "Project not found" };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function formatRange(start: string | null, end: string | null): string {
  if (!start) return "";
  return end ? `${formatDate(start)} – ${formatDate(end)}` : `${formatDate(start)} – Present`;
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function ProjectJsonLd({ project }: { project: ProjectDetailDto }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.role ?? undefined,
    url: project.liveDemoUrl ?? project.githubUrl ?? undefined,
    image: project.media[0]?.url ?? undefined,
    dateCreated: project.startDate ?? undefined,
    datePublished: project.startDate ?? undefined,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project: ProjectDetailDto;
  try {
    project = await getProject(slug);
  } catch {
    notFound();
  }

  // Related projects: fetch all & compute overlap (server-side)
  let related: Awaited<ReturnType<typeof getProjects>> = [];
  try {
    const skillIds = project.skills.map((s) => s.id);
    const all = await getProjects();
    related = all
      .filter((p) => p.id !== project.id)
      .map((p) => ({
        p,
        score: p.skills.filter((s) => skillIds.includes(s.id)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p);
  } catch { /* non-fatal */ }

  return (
    <>
      <ProjectJsonLd project={project} />
      <main className="section-container py-16">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
        >
          ← All projects
        </Link>

        <div className="max-w-3xl mx-auto space-y-10">
          {/* Title */}
          <header className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient">
              {project.title}
            </h1>

            {/* Structured metadata */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {project.role && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Role</dt>
                  <dd className="text-foreground font-medium">{project.role}</dd>
                </div>
              )}
              {project.company && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Company</dt>
                  <dd className="text-foreground font-medium">{project.company}</dd>
                </div>
              )}
              {formatRange(project.startDate, project.endDate) && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Timeline</dt>
                  <dd className="text-foreground font-medium">{formatRange(project.startDate, project.endDate)}</dd>
                </div>
              )}
            </dl>

            {/* Tech stack chips */}
            {project.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.skills.map((s) => (
                  <span key={s.id} className="skill-chip text-xs">{s.name}</span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 text-sm">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg glass glass-hover no-underline text-foreground transition-colors">
                  GitHub →
                </a>
              )}
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 no-underline transition-opacity">
                  Live Demo →
                </a>
              )}
            </div>
          </header>

          {/* Image carousel */}
          {project.media.length > 0 && (
            <ProjectCarousel media={project.media} autoplay={project.media.length > 1} />
          )}

          {/* Long-form description */}
          {project.htmlDescription && (
            <section>
              <div
                className="wiki-prose prose max-w-none
                           prose-headings:tracking-tight
                           prose-code:before:content-none prose-code:after:content-none
                           prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: project.htmlDescription }}
              />
            </section>
          )}

          {/* Video embeds */}
          <VideoSection videos={project.videos} />

          {/* Related projects */}
          {related.length > 0 && (
            <section className="pt-6 border-t border-border space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Related Projects</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/projects/${rp.slug}`}
                    className="group flex flex-col gap-2 p-4 rounded-xl glass glass-hover no-underline"
                  >
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {rp.title}
                    </h3>
                    {rp.skills.slice(0, 2).map((s) => (
                      <span key={s.id} className="skill-chip text-xs w-fit">{s.name}</span>
                    ))}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
