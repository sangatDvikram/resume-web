/**
 * LaTeX resume generator — stub implementation.
 *
 * Full implementation is delivered in EPIC 3 (E3-S5) once resume data is
 * migrated to PostgreSQL and served via the NestJS API.  This stub provides
 * the correct module signature so consumers can import now without breakage.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LatexResumeProfile {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  summary?: string;
}

export interface LatexExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description: string;
  technologies?: string[];
}

export interface LatexEducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface LatexResumeData {
  profile: LatexResumeProfile;
  experience?: LatexExperienceEntry[];
  education?: LatexEducationEntry[];
  skills?: Record<string, string[]>;
}

// ─── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate a LaTeX resume document string from structured resume data.
 *
 * @stub Full implementation delivered in E3-S5.
 */
export function generateLatexResume(data: LatexResumeData): string {
  const { profile } = data;

  // Minimal valid LaTeX document so consumers can test the pipeline end-to-end.
  return [
    '\\documentclass[11pt,a4paper]{article}',
    '\\usepackage[margin=1in]{geometry}',
    '\\usepackage{hyperref}',
    '\\begin{document}',
    '',
    `\\begin{center}`,
    `  {\\LARGE \\textbf{${escapeLatex(profile.name)}}}\\\\[4pt]`,
    `  ${escapeLatex(profile.title)}\\\\`,
    profile.email
      ? `  \\href{mailto:${profile.email}}{${escapeLatex(profile.email)}}\\\\`
      : '',
    '\\end{center}',
    '',
    '% TODO: full sections generated in E3-S5',
    '',
    '\\end{document}',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Escape special LaTeX characters in a plain-text string. */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}
