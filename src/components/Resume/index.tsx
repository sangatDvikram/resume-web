import React from "react";
import { calculateDuration, RESUME } from "@/constants";
import SEO from "@/components/SEO";
import { downloadLatexResume } from "@/utils/generateLatex";

/**
 * Resume Component - PDF/Print Version
 *
 * This component is a simplified version for PDF generation/printing.
 * It uses semantic HTML instead of MUI components.
 */

const Resume: React.FC = () => {
  return (
    <>
      <SEO title={`${RESUME.name} | Resume`} />
      <main
        className="bg-resume text-resume-fg min-h-screen p-8 print:p-4 print:text-[12pt]"
        itemScope
        itemType="https://schema.org/Person"
      >
        {/* Header */}
        <header className="text-center mb-8 border-b border-resume-border pb-6">
          <h1 className="text-3xl font-bold mb-2 print:text-[12pt]" itemProp="name">{RESUME.name}</h1>
          <p className="text-lg text-resume-muted mb-4 print:text-[10pt]" itemProp="jobTitle">{RESUME.position}</p>
          {import.meta.env.DEV && (
            <div className="hidden md:flex justify-center mb-4 print:hidden">
              <button
                onClick={downloadLatexResume}
                title="Download LaTeX source (.tex)"
                aria-label="Download resume as LaTeX source file"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span aria-hidden="true">⬇</span> Download .tex
              </button>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-resume-muted print:text-[9pt]">
            <span>
              <span aria-hidden="true">📧 </span>
              <a
                href={`mailto:${RESUME.email}`}
                itemProp="email"
                className="text-link hover:text-link-hover hover:underline transition-colors"
              >
                {RESUME.email}
              </a>
            </span>
            <span>
              <span aria-hidden="true">📱 </span>
              <a href={`tel:${RESUME.mobile}`} itemProp="telephone" className="text-link hover:text-link-hover hover:underline transition-colors">{RESUME.mobile}</a>
            </span>
            <span>
              <span aria-hidden="true">📍 </span>
              <span itemProp="address">{RESUME.address}</span>
            </span>
            <span>
              <span aria-hidden="true">🔗 </span>
              <a
                href={RESUME.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="text-link hover:text-link-hover hover:underline transition-colors"
              >
                LinkedIn
              </a>
            </span>
            <span>
              <span aria-hidden="true">🐙 </span>
              <a
                href={RESUME.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="text-link hover:text-link-hover hover:underline transition-colors"
              >
                GitHub
              </a>
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-8 md:flex-row print:flex-row">
          {/* Left Column — 60 % */}
          <div className="w-full md:w-[60%] print:w-[60%] space-y-8">
            {/* Overview */}
            <section className="mb-8">
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Overview</h2>
              <p className="text-sm text-resume-body leading-relaxed print:text-[9pt]" itemProp="description">{RESUME.description}</p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Experience</h2>
              {RESUME.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold print:text-[10pt]">{exp.title}</h3>
                  <p className="text-sm text-resume-muted print:text-[9pt]"><strong>{exp.company}</strong> • {exp.area} • {calculateDuration({ duration: exp.duration, isCurrent: exp.isCurrent })}</p>
                  <ul className="list-disc list-inside text-sm text-resume-body mt-2 print:text-[9pt]">
                    {exp.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                  {exp.techStack && exp.techStack.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-resume-fg print:text-[8pt]">Technologies: </span>
                      <span className="inline-flex flex-wrap gap-1.5 mt-1">
                        {exp.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs text-resume-muted bg-resume-border/20 border border-resume-border/50 rounded px-1.5 py-0.5 print:text-[8pt]"
                          >
                            {tech}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </section>
          </div>

          {/* Right Column — 40 % */}
          <div className="w-full md:w-[40%] print:w-[40%] space-y-4">
            {/* Patents */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Patents</h2>
              {RESUME.patents.map((patent, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm print:text-[9pt]">{patent.title}</p>
                  <a
                    href={patent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-link hover:text-link-hover hover:underline transition-colors print:text-[8pt]"
                  >
                    {patent.link} ↗
                  </a>
                </div>
              ))}
            </section>
            {/* Skills */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Skills</h2>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-sm print:text-[10pt]">Languages</h3>
                  <p className="text-sm text-resume-body print:text-[9pt]">{RESUME.languages.join(", ")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm print:text-[10pt]">Frameworks</h3>
                  <p className="text-sm text-resume-body print:text-[9pt]">{RESUME.frameworks.join(", ")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm print:text-[10pt]">Databases</h3>
                  <p className="text-sm text-resume-body print:text-[9pt]">{RESUME.databases.join(", ")}</p>
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Education</h2>
              {RESUME.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <h3 className="font-semibold text-sm print:text-[10pt]">{edu.degree}</h3>
                  <p className="text-sm text-resume-muted print:text-[9pt]">{edu.university}</p>
                  <p className="text-xs text-resume-subtle print:text-[8pt]">{edu.duration}</p>
                </div>
              ))}
            </section>

            {/* Certifications */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Certifications</h2>
              {RESUME.certifications.map((cert, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold text-sm print:text-[9pt]">{cert.title}</p>
                  <p className="text-xs text-resume-muted print:text-[8pt]">{cert.issuer}</p>
                </div>
              ))}
            </section>

            {/* Awards */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Awards</h2>
              {RESUME.awards.map((award, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold text-sm print:text-[9pt]">{award.title}</p>
                  <p className="text-xs text-resume-muted print:text-[8pt]">{award.issuer}</p>
                </div>
              ))}
            </section>

            {/* Projects */}
            <section>
              <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4 print:text-[11pt]">Projects</h2>
              {RESUME.projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-sm print:text-[9pt]">{project.title}</p>
                  <p className="text-xs text-resume-muted print:text-[8pt]">{project.company}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-link hover:text-link-hover hover:underline transition-colors print:text-[8pt]"
                  >
                    {project.link} ↗
                  </a>
                  <ul className="list-disc list-inside text-sm text-resume-body mt-2 print:text-[9pt]">
                    {project.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-resume-fg print:text-[8pt]">Technologies: </span>
                      <span className="inline-flex flex-wrap gap-1.5 mt-1">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs text-resume-muted bg-resume-border/20 border border-resume-border/50 rounded px-1.5 py-0.5 print:text-[8pt]"
                          >
                            {tech}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </section>

          </div>
        </div>
      </main>
    </>
  );
};

export default Resume;
