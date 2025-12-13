import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Award, ExternalLink } from "lucide-react";

const patents = [
  {
    title: "System and method for determining allocation of sales force",
    description: "Innovative approach to optimizing sales force distribution and resource allocation",
  },
  {
    title: "Display screen with transitional graphical user interface",
    description: "Novel UI/UX design patterns for smooth transitional interfaces",
  },
];

const Patents = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="patents" className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174_72%_56%_/_0.03)_0%,transparent_50%)]" />
      
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Innovation</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Patents</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {patents.map((patent, index) => (
            <motion.div
              key={patent.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="glass glass-hover rounded-xl p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {patent.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{patent.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Patents;
