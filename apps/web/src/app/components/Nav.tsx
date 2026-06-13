import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/blog",     label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery",  label: "Gallery" },
  { href: "/resume",   label: "Resume" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        className="section-container flex h-14 items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        {/* Wordmark / home link */}
        <Link
          href="/"
          className="font-bold text-base text-foreground no-underline hover:text-primary transition-colors tracking-tight"
        >
          VS
        </Link>

        {/* Page links */}
        <ul className="flex items-center gap-0.5 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors no-underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <ThemeToggle />
      </nav>
    </header>
  );
}
