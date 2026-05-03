import { RESUME } from "@/constants";

const Education = () => {
  return (
    <section id="education" className="py-8 relative">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Education */}
          <div className="glass rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold">Education</h3>
            </div>

            <div className="space-y-6">
              {RESUME.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary/30 pl-4">
                  <h4 className="font-medium text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{edu.university}</p>
                  <p className="text-xs text-primary font-mono mt-1">{edu.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="glass rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xl">🏅</span>
              </div>
              <h3 className="text-xl font-semibold">Certifications</h3>
            </div>

            <div className="space-y-4">
              {RESUME.certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-primary flex-shrink-0">✓</span>
                  <div>
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {cert.title}
                    </a>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold">Achievements</h3>
            </div>

            <div className="space-y-4">
              {RESUME.awards.map((award, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">{award.title}</h4>
                    <p className="text-sm text-muted-foreground">{award.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
