import { RESUME, calculateDuration } from "@/constants";

const Experience = () => {
  return (
    <section id="experience" className="py-24 relative">
      <div className="section-container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Career</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Experience</h3>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent transform md:-translate-x-1/2" />

          {RESUME.experience.map((exp, index) => (
            <div
              key={`${exp.company}-${index}`}
              className={`relative mb-12 md:mb-16 pl-8 md:pl-0 animate-fade-in ${
                index % 2 === 0 ? "md:pr-[calc(50%+2rem)]" : "md:pl-[calc(50%+2rem)]"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 top-0 w-3 h-3 rounded-full bg-primary glow-sm transform -translate-x-[5px] md:-translate-x-1/2" />

              <div className="glass glass-hover rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{exp.title}</h4>
                    <div className="flex items-center gap-2 text-primary mt-1">
                      <span>🏢</span>
                      <span className="font-medium">{exp.company}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{calculateDuration({ duration: exp.duration, isCurrent: exp.isCurrent })}</span>
                    </div>
                    <span className="text-xs">{exp.area}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {exp.tasks.map((task, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.techStack.map((tech) => (
                    <span key={tech} className="skill-chip text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
