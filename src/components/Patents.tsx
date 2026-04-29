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
  return (
    <section id="patents" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--teal-glow)_/_0.03)_0%,transparent_50%)]" />

      <div className="section-container relative">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase">Innovation</h2>
          <h3 className="text-3xl sm:text-4xl font-bold">Patents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {patents.map((patent) => (
            <div
              key={patent.title}
              className="glass glass-hover rounded-xl p-6 group animate-fade-in"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {patent.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{patent.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Patents;
