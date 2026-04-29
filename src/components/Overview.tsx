import { yearsOfExperience } from "@/constants";

const highlights = [
  {
    icon: "💻",
    title: "Technical Excellence",
    description: "Expert in React, TypeScript, and modern frontend architectures",
  },
  {
    icon: "👥",
    title: "Team Leadership",
    description: "Leading and mentoring development teams throughout the software lifecycle",
  },
  {
    icon: "💡",
    title: "Innovation",
    description: "Secured multiple patents for contributions in data analysis dashboards",
  },
  {
    icon: "🚀",
    title: "Full Stack",
    description: "From architecture design to hands-on development across the stack",
  },
];

const Overview = () => {
  return (
    <section id="overview" className="py-24 relative">
      <div className="section-container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">About Me</h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">Overview</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg">
            With <span className="text-foreground font-medium">{yearsOfExperience()}</span> of industry experience and{" "}
            <span className="text-foreground font-medium">4 years 4 months</span> of freelancing expertise, I bring a
            strong technical background in frontend development, hybrid mobile applications, and backend services.
            Beyond coding, I excel in leading and managing development teams throughout the software lifecycle,
            ensuring high-quality delivery and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="glass glass-hover rounded-xl p-6 text-center animate-fade-in"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Overview;
