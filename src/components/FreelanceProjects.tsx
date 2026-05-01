import { RESUME } from "@/constants";

const FreelanceProjects = () => {
  return (
    <section id="freelance" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--teal-glow)_/_0.04)_0%,transparent_50%)]" />

      <div className="section-container relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Side Work</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Freelancing Projects</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESUME.projects.map((project) => (
            <div
              key={project.title}
              className="glass glass-hover rounded-xl p-6 flex flex-col animate-fade-in"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💼</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground leading-tight">{project.title}</h4>
                  <p className="text-sm text-primary">{project.company}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-link hover:text-link-hover underline-offset-2 hover:underline transition-colors"
                  >
                    View Project ↗
                  </a>
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-grow">
                {project.tasks.map((task, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                {project.techStack.map((tech) => (
                  <span key={tech} className="skill-chip text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreelanceProjects;
