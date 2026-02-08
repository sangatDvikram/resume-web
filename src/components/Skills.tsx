import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code, Layers, Database, Wrench } from "lucide-react";

import skillsLanguagesImg from "@/assets/skills-languages.jpg";
import skillsFrameworksImg from "@/assets/skills-frameworks.jpg";
import skillsDatabasesImg from "@/assets/skills-databases.jpg";
import skillsToolsImg from "@/assets/skills-tools.jpg";

const skillCategories = [
  {
    title: "Languages",
    icon: Code,
    image: skillsLanguagesImg,
    skills: ["Python", "Javascript", "HTML", "CSS", "Dart", "PHP", "C#"],
  },
  {
    title: "Frameworks",
    icon: Layers,
    image: skillsFrameworksImg,
    skills: ["D3.js", "Django", "Express", "Flutter", "Node.js", "NextJS", "React", "Redux", "RxJs", "Typescript"],
  },
  {
    title: "Databases",
    icon: Database,
    image: skillsDatabasesImg,
    skills: ["Elasticsearch", "MongoDB", "PostgreSQL", "MySQL"],
  },
  {
    title: "Tools",
    icon: Wrench,
    image: skillsToolsImg,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-xl overflow-hidden group"
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
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">{category.title}</h4>
                </div>
              </div>
              
              {/* Skills */}
              <div className="p-6 pt-4">
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
