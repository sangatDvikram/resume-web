import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, } from "react-router";

const Hero = () => {
  const history = useNavigate();
  const downloadResume = () => {
    history('/resume');
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(174_72%_56%_/_0.08)_0%,transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="section-container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">Available for opportunities</span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
          >
            Vikram <span className="text-gradient">Sangat</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-6 font-light"
          >
            Senior Software Engineer
          </motion.p>

          {/* Experience badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              9+ Years Industry
            </span>
            <span className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono">
              4+ Years Freelancing
            </span>
            <span className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-mono text-primary">
              2 Patents
            </span>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-10 text-muted-foreground"
          >
            <a href="mailto:v.sangat98@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <span className="text-sm">v.sangat98@gmail.com</span>
            </a>
            <a href="tel:+919503415652" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-sm">+91 9503415652</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Bangalore, India</span>
            </span>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="gap-2 glow" onClick={downloadResume}>
              <Download className="w-4 h-4" />
              Download Resume
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => window.location.href = 'mailto:v.sangat98@gmail.com'}>
              <Mail className="w-4 h-4" />
              Get in Touch
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
