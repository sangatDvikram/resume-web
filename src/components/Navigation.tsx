import { useState, useEffect } from "react";
import { RESUME } from "@/constants";

const { avatar, navItems, name } = RESUME;

/**
 * Reads the persisted theme preference from localStorage, falling back to
 * the OS-level `prefers-color-scheme` media query when nothing is stored.
 */
const getInitialDark = (): boolean => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored !== null) return stored === "dark";
  } catch {
    /* localStorage may be blocked in certain browser contexts */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);

  /* Apply / remove the `.dark` class and persist the preference. */
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* ignore write errors */
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down ${
          isScrolled ? "glass shadow-lg" : ""
        }`}
      >
        <nav className="section-container py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              {/* Avatar */}
              <figure
                className="w-9 h-9 rounded-full border-2 border-primary/30 overflow-hidden"
                aria-label={name}
              >
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </figure>
              <span className="text-xl font-bold text-gradient">
                V<span className="text-primary">.</span>S
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Right-side actions: theme toggle (always) + hamburger (mobile) */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span className="material-icons" style={{ fontSize: 20 }}>
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <span className="text-xl">✕</span>
                ) : (
                  <span className="text-xl">☰</span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-background/95 backdrop-blur-lg md:hidden animate-fade-in">
          <nav className="section-container py-8">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/30"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;
