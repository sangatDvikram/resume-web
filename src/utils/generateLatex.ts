/**
 * generateLatex.ts
 *
 * Generates a complete, compilable LaTeX resume document from the RESUME
 * constant.  The output can be saved as a .tex file and compiled with
 * pdflatex / xelatex.
 *
 * Required LaTeX packages (all part of standard TeX Live / MiKTeX):
 *   geometry, hyperref, fontenc, inputenc, enumitem, titlesec, multicol, parskip, xcolor
 */

import { RESUME, calculateDuration } from "@/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape characters that are special in LaTeX. */
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/↗/g, "")
    .replace(/•/g, "\\textbullet{}");
}

/** Full-width section heading with a rule underneath. */
function sectionTitle(title: string): string {
  return `\\vspace{0.5pt}\n{\\large\\bfseries ${esc(title)}}\\\\[-2pt]\n\\rule{\\linewidth}{0.4pt}\\\\[2pt]\n`;
}

/** Compact bullet list. */
function itemList(items: string[]): string {
  const rows = items.map((t) => `  \\item ${esc(t)}`).join("\n");
  return `\\begin{itemize}[leftmargin=1.5em,itemsep=0pt,parsep=0pt,topsep=0pt,partopsep=0pt]\n${rows}\n\\end{itemize}`;
}

// ---------------------------------------------------------------------------
// Section renderers  (all single-column — page breaks are handled by LaTeX)
// ---------------------------------------------------------------------------

function header(): string {
  return `{\\centering
  {\\LARGE\\bfseries ${esc(RESUME.name)}}\\\\[3pt]
  {\\normalsize ${esc(RESUME.position)}}\\\\[5pt]
  \\small
  \\href{mailto:${esc(RESUME.email)}}{${esc(RESUME.email)}} $\\mid$
  \\href{tel:${esc(RESUME.mobile)}}{${esc(RESUME.mobile)}} $\\mid$
  ${esc(RESUME.address)} $\\mid$
  \\href{${esc(RESUME.linkedIn)}}{LinkedIn} $\\mid$
  \\href{${esc(RESUME.github)}}{GitHub}
\\par}
\\vspace{4pt}
`;
}

function overview(): string {
  return sectionTitle("Overview") + `\\small ${esc(RESUME.description.trim())}\\par\\vspace{4pt}\n`;
}

function experience(): string {
  let out = sectionTitle("Experience");
  for (const exp of RESUME.experience) {
    const duration = calculateDuration({ duration: exp.duration, isCurrent: exp.isCurrent });
    out += `\\textbf{${esc(exp.title)}}\\\\
\\textit{${esc(exp.company)}} $\\bullet$ ${esc(exp.area)} $\\bullet$ \\textit{\\small ${esc(duration)}}\\\\
${itemList(exp.tasks)}
${exp.techStack?.length ? `\\\\[-2pt]\\textbf{\\small Tech:} \\small ${esc(exp.techStack.join(", "))}` : ""}
\\vspace{5pt}\n\n`;
  }
  return out;
}

function skills(): string {
  return (
    sectionTitle("Skills") +
    `\\textbf{Languages:} ${esc(RESUME.languages.join(", "))}\\\\
\\textbf{Frameworks:} ${esc(RESUME.frameworks.join(", "))}\\\\
\\textbf{Databases:} ${esc(RESUME.databases.join(", "))}\n`
  );
}

function education(): string {
  let out = sectionTitle("Education");
  for (const edu of RESUME.education) {
    out += `\\textbf{${esc(edu.degree)}} \\hfill ${esc(edu.duration)}\\\\
\\textit{\\small ${esc(edu.university)}}\\\\[4pt]\n`;
  }
  return out;
}

function patents(): string {
  let out = sectionTitle("Patents");
  for (const p of RESUME.patents) {
    out += `${esc(p.title)} --- \\href{${esc(p.url)}}{\\small ${esc(p.link)}}\\\\[3pt]\n`;
  }
  return out;
}

function certifications(): string {
  let out = sectionTitle("Certifications");
  for (const cert of RESUME.certifications) {
    out += `\\textbf{${esc(cert.title)}}\\\\
\\textit{\\small ${esc(cert.issuer)}}\\\\[4pt]\n`;
  }
  return out;
}

function awards(): string {
  let out = sectionTitle("Awards");
  for (const award of RESUME.awards) {
    out += `\\textbf{${esc(award.title)}}\\\\
\\textit{\\small ${esc(award.issuer)}}\\\\[4pt]\n`;
  }
  return out;
}

function projects(): string {
  let out = sectionTitle("Projects");
  for (const proj of RESUME.projects) {
    out += `\\textbf{${esc(proj.title)}} \\quad \\textit{${esc(proj.company)}} \\hfill \\href{${esc(proj.link)}}{\\small ${esc(proj.link)}}\\\\[-4pt]
${itemList(proj.tasks)}
${proj.techStack?.length ? `\\\\[-6pt]\\textbf{\\small Tech:} \\small ${esc(proj.techStack.join(", "))}` : ""}
\\vspace{3pt}\n\n`;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Returns a complete, compilable LaTeX document string for the resume.
 * Save the result as `resume.tex` and compile with:
 *   pdflatex resume.tex
 */
export function generateLatexResume(): string {
  const preamble = `\\documentclass[a4paper,10pt]{article}
\\usepackage[top=0.8cm,bottom=0.8cm,left=1.2cm,right=1.2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{parskip}
\\usepackage{xcolor}
\\hypersetup{colorlinks=true,urlcolor=blue,linkcolor=blue}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\begin{document}
`;

  const body = [
    header(),
    overview(),
    patents(),
    experience(),
    skills(),
    education(),
    certifications(),
    awards(),
    projects(),
  ].join("");

  return preamble + body + "\n\\end{document}\n";
}

/**
 * Triggers a browser download of `resume.tex`.
 */
export function downloadLatexResume(): void {
  const content = generateLatexResume();
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.tex";
  a.click();
  URL.revokeObjectURL(url);
}
