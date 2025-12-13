import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Users, Lightbulb, Rocket } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Technical Excellence",
    description: "Expert in React, TypeScript, and modern frontend architectures",
  },
  {
    icon: Users,
    title: "Team Leadership",
    description: "Leading and mentoring development teams throughout the software lifecycle",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Secured multiple patents for contributions in data analysis dashboards",
  },
  {
    icon: Rocket,
    title: "Full Stack",
    description: "From architecture design to hands-on development across the stack",
  },
];

const Overview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="overview" className="py-24 relative" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">About Me</h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">Overview</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg">
            With <span className="text-foreground font-medium">9 years 5 months</span> of industry experience and{" "}
            <span className="text-foreground font-medium">4 years 4 months</span> of freelancing expertise, I bring a 
            strong technical background in frontend development, hybrid mobile applications, and backend services. 
            Beyond coding, I excel in leading and managing development teams throughout the software lifecycle, 
            ensuring high-quality delivery and innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass glass-hover rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Overview;
