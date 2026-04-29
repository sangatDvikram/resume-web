const projects = [
  {
    title: "A3 Ultimate Account Control Panel",
    client: "A3 Ultimate Games",
    description: [
      "Created platform to manage in-game purchases and account management via web application",
      "Integrated Paypal and PayU Money payment services for in-game items purchase",
      "Created blogging system for players to share their experience",
    ],
    technologies: ["Bootstrap", "MySQL", "PHP", "MSSQL", "CodeIgniter"],
  },
  {
    title: "A3 Ultimate Game Client Updater",
    client: "A3 Ultimate Games",
    description: [
      "Created client updater application for generating on the fly updates and new features",
      "Integrated MD5 Checksum generation and validation for updating new patch files",
    ],
    technologies: ["C#", "MD5"],
  },
  {
    title: "Transwise",
    client: "Tiru Ghisewad - Transwise",
    description: [
      "Platform for booking rental cars as well as rent drivers",
      "Integrated receipts tax calculations, scheduling emails on each trip complete and printing",
    ],
    technologies: ["Bootstrap", "MySQL", "PHP", "CodeIgniter"],
  },
];

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
          {projects.map((project) => (
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
                  <p className="text-sm text-primary">{project.client}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-grow">
                {project.description.map((desc, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
                    {desc}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                {project.technologies.map((tech) => (
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
