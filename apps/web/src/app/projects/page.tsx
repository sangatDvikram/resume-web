import type { Metadata } from "next";
import { getProjects } from "@/lib/api";
import type { ProjectSummaryDto, SkillRefDto } from "@/lib/api";
import { ProjectsClient } from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of projects — side projects, open-source work, and professional highlights.",
};

// ISR: revalidate at most once per minute; on-demand via /api/revalidate with tag "projects"
export const revalidate = 60;

export default async function ProjectsPage() {
  let projects: ProjectSummaryDto[] = [];

  try {
    projects = await getProjects();
  } catch {
    projects = [];
  }

  // Derive unique skills across all projects for the filter bar
  const skillMap = new Map<string, SkillRefDto>();
  for (const project of projects) {
    for (const skill of project.skills) {
      if (!skillMap.has(skill.id)) skillMap.set(skill.id, skill);
    }
  }
  const allSkills = Array.from(skillMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <main className="section-container py-16">
      {/* Header */}
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Projects</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A showcase of side projects, open-source work, and professional highlights.
        </p>
      </div>

      <ProjectsClient projects={projects} allSkills={allSkills} />
    </main>
  );
}
