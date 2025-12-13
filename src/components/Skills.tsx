import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code, Layers, Database, Wrench } from "lucide-react";

const skillCategories = [
  {
    title: "Languages",
    icon: Code,
    skills: ["Python", "Javascript", "HTML", "CSS", "Dart", "PHP", "C#"],
  },
  {
    title: "Frameworks",
    icon: Layers,
    skills: ["D3.js", "Django", "Express", "Flutter", "Node.js", "NextJS", "React", "Redux", "RxJs", "Typescript"],
  },
  {
    title: "Databases",
    icon: Database,
    skills: ["Elasticsearch", "MongoDB", "PostgreSQL", "MySQL"],
  },
  {
    title: "Tools",
    icon: Wrench,
    skills: ["Visual Studio Code", "Android Studio", "Postman", "git"],
  },
];

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(174_72%_56%_/_0.05)_0%,transparent_50%)]" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Expertise</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Skills & Technologies</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-lg font-semibold">{category.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
                    className="skill-chip"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
