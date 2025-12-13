import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Calendar } from "lucide-react";

const experiences = [
  {
    title: "Senior Software Engineer - Frontend",
    company: "Tekion",
    location: "Bangalore, India",
    period: "December 2022 - Present",
    highlights: [
      "Leading a team of frontend engineers, driving development and optimization of scalable applications",
      "Managing the DRP Onboarding modules throughout the development lifecycle",
      "Architected a monorepo-based application, enhancing code reusability and maintainability",
      "Designed onboarding workflows for dealers and OEMs, streamlining user experience",
    ],
    technologies: ["React", "Redux", "Thunk", "Webpack 5"],
  },
  {
    title: "Senior Software Engineer - UI",
    company: "Visa",
    location: "Bangalore, India",
    period: "December 2021 - November 2022",
    highlights: [
      "Led the UI development team for Merchant Onboarding application",
      "Implemented micro frontends with React, utilizing manifests for dynamic configuration",
      "Developed common UI components for Rapid Seller Onboarding Platform",
      "Integrated third-party APIs (ThreatMatrix, Giact, Experian) for user verification",
    ],
    technologies: ["React", "Redux", "Single-SPA", "RxJs", "Material-UI"],
  },
  {
    title: "Web Full Stack Developer",
    company: "DMart Labs (Avenue Supermarkets Ltd)",
    location: "Bangalore, India",
    period: "October 2019 - November 2021",
    highlights: [
      "Led the frontend team, overseeing development of in-house applications",
      "Architected a micro frontend system using Single SPA",
      "Designed Application Development SDK and Component Libraries, cutting development time by 50%",
      "Built a hybrid mobile application leveraging Flutter and React",
    ],
    technologies: ["React", "Redux", "Node.js", "Single-SPA", "RxJs", "Flutter", "Material-UI"],
  },
  {
    title: "Software Engineer - Frontend",
    company: "Innoplexus Consulting Services Pvt Ltd",
    location: "Pune, India",
    period: "November 2017 - October 2019",
    highlights: [
      "Led a team of 2-3 developers to design data analytics dashboards",
      "Developed API services using Express, Django, Elasticsearch, and MongoDB",
      "Built dashboards for patent analysis, enhancing data accessibility",
      "Developed data processing pipelines for Patent Family statistics",
    ],
    technologies: ["React", "Node.js", "Django", "Express", "Elasticsearch", "MongoDB", "Python"],
  },
  {
    title: "CoFounder",
    company: "Pole8",
    location: "Nagpur, India",
    period: "June 2017 - November 2017",
    highlights: [
      "Developed Django-based application for visualizing coordinate collections on maps",
      "Implemented location clustering algorithm for grouping user images",
      "Built Android application for capturing geotagged images",
    ],
    technologies: ["Semantic UI", "Django", "PostgreSQL", "Leaflet", "JQuery", "Python"],
  },
  {
    title: "CoFounder",
    company: "Vritt",
    location: "Nagpur, India",
    period: "June 2016 - June 2017",
    highlights: [
      "Integrated NLP libraries (Stanford NER, NLTK, Polyglot) within Django application",
      "Developed web crawlers for automated data curation",
      "Designed responsive website using Django templates and Semantic UI",
    ],
    technologies: ["Semantic UI", "Django", "PostgreSQL", "Stanford-NER", "NLTK", "Polyglot", "Python"],
  },
];

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="experience" className="py-24 relative" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Career</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Experience</h3>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent transform md:-translate-x-1/2" />

          {experiences.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${exp.period}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative mb-12 md:mb-16 pl-8 md:pl-0 ${
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
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{exp.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{exp.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span key={tech} className="skill-chip text-xs">
                      {tech}
                    </span>
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

export default Experience;
