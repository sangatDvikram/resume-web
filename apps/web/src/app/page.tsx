import Image from "next/image";
import Link from "next/link";
import { getResume, getBlogPosts, getProjects, getAlbums } from "@/lib/api";
import type {
  BlogPostSummaryDto,
  ProjectSummaryDto,
  AlbumSummaryDto,
  SkillDto,
} from "@/lib/api";
import { OatBadge } from "@portfolio-cms/oat-ui";

export const revalidate = 60;

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks & Libraries",
  database: "Databases",
  tool: "Tools & Platforms",
};

const CATEGORY_ORDER = ["language", "framework", "database", "tool"] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPostSummaryDto }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group no-underline flex flex-col h-full">
      <article className="flex flex-col overflow-hidden rounded-xl glass glass-hover h-full transition-all">
        {post.coverImageUrl && (
          <div className="relative h-44 overflow-hidden shrink-0">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <OatBadge key={tag.id} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                  {tag.name}
                </OatBadge>
              ))}
            </div>
          )}
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            )}
            {post.readingTime && <span>{post.readingTime} min read</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

function ProjectCard({ project }: { project: ProjectSummaryDto }) {
  const cover = project.media[0]?.url ?? null;
  return (
    <Link href={`/projects/${project.slug}`} className="group no-underline flex flex-col h-full">
      <article className="flex flex-col overflow-hidden rounded-xl glass glass-hover h-full transition-all">
        {cover ? (
          <div className="relative h-44 overflow-hidden shrink-0">
            <Image
              src={cover}
              alt={project.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-44 shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <span className="text-4xl opacity-40">⚡</span>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {project.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.skills.slice(0, 3).map((s) => (
                <OatBadge key={s.id} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                  {s.name}
                </OatBadge>
              ))}
            </div>
          )}
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.role && (
            <p className="text-xs text-muted-foreground">{project.role}</p>
          )}
          <div className="mt-auto flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
            {project.company && <span>{project.company}</span>}
            {project.startDate && (
              <span className="ml-auto">{formatDate(project.startDate)}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function AlbumCard({ album }: { album: AlbumSummaryDto }) {
  return (
    <Link
      href={`/gallery/${album.slug}`}
      className="group relative w-full h-full overflow-hidden rounded-xl block no-underline"
    >
      {album.coverUrl ? (
        <Image
          src={album.coverUrl}
          alt={album.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder={album.lqipUrl ? "blur" : "empty"}
          blurDataURL={album.lqipUrl ?? undefined}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-4xl">📷</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white font-medium text-sm leading-snug truncate">{album.name}</p>
        <p className="text-white/70 text-xs">{album.photoCount} photos</p>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [resumeResult, postsResult, projectsResult, albumsResult] =
    await Promise.allSettled([
      getResume(),
      getBlogPosts(),
      getProjects(),
      getAlbums(),
    ]);

  const resume = resumeResult.status === "fulfilled" ? resumeResult.value : null;
  const allPosts = postsResult.status === "fulfilled" ? postsResult.value : [];
  const allProjects = projectsResult.status === "fulfilled" ? projectsResult.value : [];
  const allAlbums = albumsResult.status === "fulfilled" ? albumsResult.value : [];

  const profile = resume?.profile;
  const skills: SkillDto[] = resume?.skills ?? [];

  const recentPosts = allPosts.slice(0, 3);
  const featuredProjects = allProjects.filter((p) => p.featured);
  const displayProjects = (featuredProjects.length > 0 ? featuredProjects : allProjects).slice(0, 3);
  const previewAlbums = allAlbums.slice(0, 4);

  const skillsByCategory = skills.reduce<Record<string, SkillDto[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <main className="flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center gap-8 section-container py-24 text-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 glow">
          <Image
            src={profile?.avatarUrl ?? "/profile.jpeg"}
            alt={profile?.name ?? "Profile photo"}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            {profile?.name ?? "Portfolio"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {profile?.position ?? "Software Engineer"}
          </p>
        </div>

        {profile?.description && (
          <p className="max-w-xl text-muted-foreground leading-relaxed">
            {profile.description}
          </p>
        )}

        {profile?.yearsOfExperienceString && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-slow" />
            {profile.yearsOfExperienceString} years of professional experience
          </div>
        )}

        {profile && (
          <div className="flex items-center gap-4 text-sm">
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Email
              </a>
            )}
          </div>
        )}
      </section>

      {/* ── Skills showcase ──────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <section className="section-container py-16 border-t border-border">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Skills &amp; Expertise</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {CATEGORY_ORDER.map((cat) => {
              const items = skillsByCategory[cat];
              if (!items?.length) return null;
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill.id} className="skill-chip">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Projects ─────────────────────────────────────────────────────────── */}
      {displayProjects.length > 0 && (
        <section className="section-container py-16 border-t border-border">
          <SectionHeader
            title={featuredProjects.length > 0 ? "Featured Projects" : "Projects"}
            href="/projects"
            linkLabel="All projects"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* ── Latest Blog Posts ─────────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="section-container py-16 border-t border-border">
          <SectionHeader title="Latest Posts" href="/blog" linkLabel="All posts" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ── Gallery preview ───────────────────────────────────────────────────── */}
      {previewAlbums.length > 0 && (
        <section className="section-container py-20 border-t border-border">
          <SectionHeader title="Gallery" href="/gallery" linkLabel="View gallery" />
          {/* 400×400 card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewAlbums.map((album) => (
              <div key={album.id} className="w-full" style={{ width: "300px" , height: "300px" }}>
                <AlbumCard album={album} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pb-16" />
    </main>
  );
}
