import React from "react";
import { calculateDuration, RESUME } from "@/constants";
import SEO from "@/components/SEO";

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
      className="bg-resume text-resume-fg min-h-screen p-8 print:p-4"
      itemScope
      itemType="https://schema.org/Person"
    >
      {/* Header */}
      <header className="text-center mb-8 border-b border-resume-border pb-6">
        <h1 className="text-3xl font-bold mb-2" itemProp="name">{RESUME.name}</h1>
        <p className="text-lg text-resume-muted mb-4" itemProp="jobTitle">{RESUME.position}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-resume-muted">
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
            <span itemProp="telephone">{RESUME.mobile}</span>
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
      {/* Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Overview</h2>
        <p className="text-sm text-resume-body leading-relaxed" itemProp="description">{RESUME.description}</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">

          {/* Patents */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Patents</h2>
            {RESUME.patents.map((patent, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold text-sm">{patent.title}</p>
                <a
                  href={patent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-link hover:text-link-hover hover:underline transition-colors"
                >
                  {patent.link} ↗
                </a>
              </div>
            ))}
          </section>
          {/* Experience */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Experience</h2>
            {RESUME.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-sm text-resume-muted"><strong>{exp.company}</strong> • {exp.area} • {calculateDuration({ duration: exp.duration, isCurrent: exp.isCurrent })}</p>
                <ul className="list-disc list-inside text-sm text-resume-body mt-2">
                  {exp.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
                {exp.techStack && exp.techStack.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-resume-fg">Technologies: </span>
                    <span className="inline-flex flex-wrap gap-1.5 mt-1">
                      {exp.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs text-resume-muted bg-resume-border/20 border border-resume-border/50 rounded px-1.5 py-0.5"
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

        {/* Right Column */}
        <div className="space-y-4">
          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Skills</h2>
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-sm">Languages</h3>
                <p className="text-sm text-resume-body">{RESUME.languages.join(", ")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Frameworks</h3>
                <p className="text-sm text-resume-body">{RESUME.frameworks.join(", ")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Databases</h3>
                <p className="text-sm text-resume-body">{RESUME.databases.join(", ")}</p>
              </div>
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Education</h2>
            {RESUME.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="font-semibold text-sm">{edu.degree}</h3>
                <p className="text-sm text-resume-muted">{edu.university}</p>
                <p className="text-xs text-resume-subtle">{edu.duration}</p>
              </div>
            ))}
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Certifications</h2>
            {RESUME.certifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold text-sm">{cert.title}</p>
                <p className="text-xs text-resume-muted">{cert.issuer}</p>
              </div>
            ))}
          </section>

          {/* Awards */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Awards</h2>
            {RESUME.awards.map((award, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold text-sm">{award.title}</p>
                <p className="text-xs text-resume-muted">{award.issuer}</p>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Projects</h2>
            {RESUME.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold text-sm">{project.title}</p>
                <p className="text-xs text-resume-muted">{project.company}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-link hover:text-link-hover hover:underline transition-colors"
                >
                  {project.link} ↗
                </a>
                <ul className="list-disc list-inside text-sm text-resume-body mt-2">
                  {project.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-resume-fg">Technologies: </span>
                    <span className="inline-flex flex-wrap gap-1.5 mt-1">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs text-resume-muted bg-resume-border/20 border border-resume-border/50 rounded px-1.5 py-0.5"
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
