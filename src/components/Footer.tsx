import { RESUME } from "@/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const nameParts = RESUME.name.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];
  const heroTitle = RESUME.position.split(" - ")[0];

  return (
    <footer className="py-12 border-t border-border/50">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-xl font-bold">
              {firstName} <span className="text-gradient">{lastName}</span>
            </h3>
            <p className="text-sm text-muted-foreground">{heroTitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a
              href={`mailto:${RESUME.email}`}
              className="flex items-center gap-2 text-link hover:text-link-hover transition-colors"
            >
              <span>✉️</span>
              <span>{RESUME.email}</span>
            </a>
            <a
              href={`tel:${RESUME.mobile}`}
              className="flex items-center gap-2 text-link hover:text-link-hover transition-colors"
            >
              <span>📞</span>
              <span>{RESUME.mobile}</span>
            </a>
            <span className="flex items-center gap-2">
              <span>📍</span>
              <span>{RESUME.address}</span>
            </span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {RESUME.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
