import React from "react";
import { RESUME } from "@/constants";

/**
 * Resume Component - PDF/Print Version
 *
 * This component is a simplified version for PDF generation/printing.
 * It uses semantic HTML instead of MUI components.
 */

const Resume: React.FC = () => {
  return (
    <div className="bg-resume text-resume-fg min-h-screen p-8 print:p-4">
      {/* Header */}
      <header className="text-center mb-8 border-b border-resume-border pb-6">
        <h1 className="text-3xl font-bold mb-2">{RESUME.name}</h1>
        <p className="text-lg text-resume-muted mb-4">{RESUME.position}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-resume-muted">
          <span>📧
            <a href={`mailto:${RESUME.email}`} className="hover:underline link">
              {RESUME.email}
            </a>
          </span>
          <span>📱 {RESUME.mobile}</span>
          <span>📍 {RESUME.address}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Overview</h2>
            <p className="text-sm text-resume-body leading-relaxed">{RESUME.description}</p>
          </section>
          {/* Patents */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Patents</h2>
            {RESUME.patents.map((patent, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold text-sm">{patent.title}</p>
                <p className="text-xs text-resume-subtle">{patent.link}</p>
              </div>
            ))}
          </section>
          {/* Experience */}
          <section>
            <h2 className="text-xl font-bold border-b border-resume-border pb-2 mb-4">Experience</h2>
            {RESUME.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-sm text-resume-muted">{exp.company} • {exp.area}</p>
                <ul className="list-disc list-inside text-sm text-resume-body mt-2">
                  {exp.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
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
                <h4 className="font-semibold text-sm">Languages</h4>
                <p className="text-sm text-resume-body">{RESUME.languages.join(", ")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Frameworks</h4>
                <p className="text-sm text-resume-body">{RESUME.frameworks.join(", ")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Databases</h4>
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


        </div>
      </div>
    </div>
  );
};

export default Resume;
