import { useNavigate } from "react-router";

const AVATAR_URL = "https://www.gravatar.com/avatar/7384e1fc27b2c82cc01ab728f681f326?s=400";

const Hero = () => {
  const history = useNavigate();
  const downloadResume = () => {
    history('/resume');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${AVATAR_URL})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

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
            Vikram <span className="text-gradient">Sangat</span>
          </h1>

          {/* Title */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-6 font-light">
            Senior Software Engineer
          </p>

          {/* Experience badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              9+ Years Industry
            </span>
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              4+ Years Freelancing
            </span>
            <span className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-mono text-primary">
              2 Patents
            </span>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-muted-foreground">
            <a href="mailto:v.sangat98@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="text-lg">✉️</span>
              <span className="text-sm">v.sangat98@gmail.com</span>
            </a>
            <a href="tel:+919503415652" className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="text-lg">📞</span>
              <span className="text-sm">+91 9503415652</span>
            </a>
            <span className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-sm">Bangalore, India</span>
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadResume}
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors glow"
            >
              <span>📄</span>
              Download Resume
            </button>
            <button
              onClick={() => window.location.href = 'mailto:v.sangat98@gmail.com'}
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
