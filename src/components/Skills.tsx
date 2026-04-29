import skillsLanguagesImg from "@/assets/skills-languages.jpg";
import skillsFrameworksImg from "@/assets/skills-frameworks.jpg";
import skillsDatabasesImg from "@/assets/skills-databases.jpg";
import skillsToolsImg from "@/assets/skills-tools.jpg";

const skillCategories = [
  {
    title: "Languages",
    icon: "💻",
    image: skillsLanguagesImg,
    skills: ["Python", "Javascript", "HTML", "CSS", "Dart", "PHP", "C#"],
  },
  {
    title: "Frameworks",
    icon: "📦",
    image: skillsFrameworksImg,
    skills: ["D3.js", "Django", "Express", "Flutter", "Node.js", "NextJS", "React", "Redux", "RxJs", "Typescript"],
  },
  {
    title: "Databases",
    icon: "🗄️",
    image: skillsDatabasesImg,
    skills: ["Elasticsearch", "MongoDB", "PostgreSQL", "MySQL"],
  },
  {
    title: "Tools",
    icon: "🔧",
    image: skillsToolsImg,
    skills: ["Visual Studio Code", "Android Studio", "Postman", "git"],
  },
];

const Skills = () => {
  return (
    <section id="skills" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--teal-glow)_/_0.05)_0%,transparent_50%)]" />

      <div className="section-container relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Expertise</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Skills & Technologies</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className="glass rounded-xl overflow-hidden group animate-fade-in"
            >
              {/* Image Header */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-xl">{category.icon}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">{category.title}</h4>
                </div>
              </div>

              {/* Skills */}
              <div className="p-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
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

export default Skills;
