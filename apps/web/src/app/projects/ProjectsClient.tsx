"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectSummaryDto, SkillRefDto } from "@/lib/api";
import { OatBadge, OatButton, OatSelect } from "@portfolio-cms/oat-ui";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – Present`;
}

// ── Featured strip ────────────────────────────────────────────────────────────

function FeaturedCard({ project }: { project: ProjectSummaryDto }) {
  const cover = project.media[0]?.url ?? null;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass glass-hover min-h-[260px] no-underline"
    >
      {cover && (
        <div className="absolute inset-0">
          <Image
            src={cover}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          />
        </div>
      )}
      <div className="relative flex flex-col gap-2 p-6 mt-auto">
        {project.skills.slice(0, 3).map((s) => (
          <OatBadge key={s.id} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>{s.name}</OatBadge>
        ))}
        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h2>
        {project.role && <p className="text-sm text-muted-foreground">{project.role}</p>}
      </div>
    </Link>
  );
}

// ── Regular project card ──────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectSummaryDto }) {
  const cover = project.media[0]?.url ?? null;
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl glass glass-hover transition-all">
      {cover && (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={cover}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.skills.slice(0, 4).map((s) => (
              <OatBadge key={s.id} style={{ fontSize: "0.75rem", padding: "2px 8px" }}>{s.name}</OatBadge>
            ))}
          </div>
        )}
        <h2 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          <Link href={`/projects/${project.slug}`} className="no-underline">{project.title}</Link>
        </h2>
        {project.role && (
          <p className="text-xs text-muted-foreground">{project.role}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          {formatDateRange(project.startDate, project.endDate) && (
            <span>{formatDateRange(project.startDate, project.endDate)}</span>
          )}
          {(project.githubUrl || project.liveDemoUrl) && (
            <div className="ml-auto flex gap-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors" onClick={e => e.stopPropagation()}>
                  GitHub
                </a>
              )}
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors" onClick={e => e.stopPropagation()}>
                  Demo
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

type SortMode = "featured" | "recent" | "alphabetical";

interface Props {
  projects: ProjectSummaryDto[];
  allSkills: SkillRefDto[];
}

export function ProjectsClient({ projects, allSkills }: Props) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("featured");

  const featured = projects.filter((p) => p.featured).slice(0, 3);

  const filtered = useMemo(() => {
    let list = activeSkill
      ? projects.filter((p) => p.skills.some((s) => s.id === activeSkill))
      : projects;

    if (sort === "recent") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "alphabetical") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => a.sortOrder - b.sortOrder);

    return list;
  }, [projects, activeSkill, sort]);

  return (
    <div className="space-y-14">
      {/* Featured strip */}
      {featured.length > 0 && !activeSkill && (
        <section>
          <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-widest mb-4">Featured</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <FeaturedCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Skill filter */}
        <div className="flex flex-wrap gap-2">
          <OatButton
            variant={activeSkill === null ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveSkill(null)}
          >
            All
          </OatButton>
          {allSkills.map((s) => (
            <OatButton
              key={s.id}
              variant={activeSkill === s.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveSkill(activeSkill === s.id ? null : s.id)}
            >
              {s.name}
            </OatButton>
          ))}
        </div>
        {/* Sort */}
        <OatSelect
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          options={[
            { value: "featured", label: "Featured first" },
            { value: "recent", label: "Most recent" },
            { value: "alphabetical", label: "A → Z" },
          ]}
          style={{ minWidth: 160 }}
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <p className="text-lg">No projects match this filter.</p>
          <OatButton variant="ghost" size="sm" onClick={() => setActiveSkill(null)}>
            Clear filter
          </OatButton>
        </div>
      )}
    </div>
  );
}
