import { useNavigate } from "react-router";
import { gravatar, RESUME, yearsOfExperience, CAREER_START_DATE } from "@/constants";

const Hero = () => {
  const navigate = useNavigate();

  const nameParts = RESUME.name.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];
  const heroTitle = RESUME.position.split(" - ")[0];
  const industryYears = yearsOfExperience().trim().split(" ")[0];
  const freelanceYears = yearsOfExperience(new Date(2012, 2, 1), CAREER_START_DATE).trim().split(" ")[0];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${gravatar(400)})` }}
      />

      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--teal-glow)_/_0.08)_0%,transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="section-container relative z-10 py-20">
        <div className="text-center animate-fade-in">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
            <span className="text-sm text-muted-foreground">Available for opportunities</span>
          </div>

          {/* Name */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {firstName} <span className="text-gradient">{lastName}</span>
          </h1>

          {/* Title */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-6 font-light">
            {heroTitle}
          </p>

          {/* Experience badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              {industryYears}+ Years Industry
            </span>
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              {freelanceYears}+ Years Freelancing
            </span>
            <span className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-mono text-primary">
              {RESUME.patents.length} Patents
            </span>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-muted-foreground">
            <a href={`mailto:${RESUME.email}`} className="flex items-center gap-2  transition-colors">
              <span className="text-lg">✉️</span>
              <span className="text-sm">{RESUME.email}</span>
            </a>
            <a href={`tel:${RESUME.mobile}`} className="flex items-center gap-2  transition-colors">
              <span className="text-lg">📞</span>
              <span className="text-sm">{RESUME.mobile}</span>
            </a>
            <span className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-sm">{RESUME.address}</span>
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/resume")}
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>📄</span>
              Download Resume
            </button>
            <button
              onClick={() => window.location.href = `mailto:${RESUME.email}`}
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>✉️</span>
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
