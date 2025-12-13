import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Github, Linkedin, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border/50">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-xl font-bold">
              Vikram <span className="text-gradient">Sangat</span>
            </h3>
            <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="mailto:v.sangat98@gmail.com"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>v.sangat98@gmail.com</span>
            </a>
            <a
              href="tel:+919503415652"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+91 9503415652</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Bangalore, India</span>
            </span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Vikram Sangat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
