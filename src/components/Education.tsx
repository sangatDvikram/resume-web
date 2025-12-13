import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Award, Trophy, CheckCircle } from "lucide-react";

const education = [
  {
    degree: "Bachelor of Engineering, Computer Science",
    institution: "Jhulelal Institute Of Technology, Nagpur",
    period: "2008 - 2012",
  },
  {
    degree: "Master of Technology, CS and IT",
    institution: "Vishwakarma Institute of Technology, Pune",
    period: "2013 - 2015",
    note: "Completed coursework",
  },
];

const certifications = [
  {
    title: "Certified Blockchain Developer",
    issuer: "Blockchain Council",
  },
];

const achievements = [
  {
    title: "Jedi Knight for versatile performance",
    issuer: "Innoplexus Consulting Services Pvt Ltd",
  },
  {
    title: "Mentored in PyCamp 2K17",
    issuer: "PyCamp 2K17 - Nagpur",
  },
];

const Education = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="py-24 relative" ref={ref}>
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Education</h3>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary/30 pl-4">
                  <h4 className="font-medium text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{edu.institution}</p>
                  <p className="text-xs text-primary font-mono mt-1">{edu.period}</p>
                  {edu.note && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic">({edu.note})</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Certifications</h3>
            </div>

            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Achievements</h3>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Education;
