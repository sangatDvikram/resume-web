import { lazy, Suspense } from "react";
import SEO from "@/components/SEO";

// Section-level code splitting: every section loads its own chunk so the
// browser can fetch, parse, and paint each independently as the user scrolls.
const Navigation       = lazy(() => import("@/components/Navigation"));
const Hero             = lazy(() => import("@/components/Hero"));
const Overview         = lazy(() => import("@/components/Overview"));
const Patents          = lazy(() => import("@/components/Patents"));
const Hobbies          = lazy(() => import("@/components/Hobbies"));
const Experience       = lazy(() => import("@/components/Experience"));
const Skills           = lazy(() => import("@/components/Skills"));
const Education        = lazy(() => import("@/components/Education"));
const FreelanceProjects = lazy(() => import("@/components/FreelanceProjects"));
const Footer           = lazy(() => import("@/components/Footer"));

// ---------------------------------------------------------------------------
// Skeleton fallbacks
// Each placeholder matches the rough height of the section it stands in for,
// preventing layout shift while the chunk downloads.
// ---------------------------------------------------------------------------

/** Fixed-height bar for the navigation strip (h-16 = 64 px). */
const NavSkeleton = () => <div className="h-16 w-full" aria-hidden />;

/** Full-viewport placeholder for the hero section. */
const HeroSkeleton = () => <div className="min-h-screen w-full" aria-hidden />;

/** Generic below-the-fold section spinner: py-24 matches every section's padding. */
const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center" aria-label="Loading section">
    <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

// ---------------------------------------------------------------------------

const Index = () => (
  <main className="min-h-screen bg-background">
    {/* Inject page title + social meta tags — no visual output, no CLS risk */}
    <SEO />
    {/* Navigation renders above the fold — use a height-matched blank so the
        page does not shift when the fixed header appears. */}
    <Suspense fallback={<NavSkeleton />}>
      <Navigation />
    </Suspense>

    {/* Hero is the first visible section; its skeleton reserves the viewport
        so no jarring reflow occurs while the chunk loads. */}
    <Suspense fallback={<HeroSkeleton />}>
      <Hero />
    </Suspense>

    {/* Every section below the fold has its own boundary so each can paint
        as soon as its chunk resolves, independent of sibling sections. */}
    <Suspense fallback={<SectionLoader />}>
      <Overview />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Patents />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Hobbies />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Experience />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Skills />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Education />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <FreelanceProjects />
    </Suspense>

    <Suspense fallback={<SectionLoader />}>
      <Footer />
    </Suspense>
  </main>
);

export default Index;
