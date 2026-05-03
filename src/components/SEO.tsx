import { Helmet } from "react-helmet-async";
import { RESUME, URL as SITE_URL, gravatar, yearsOfExperience, CAREER_START_DATE } from "@/constants";

// ---------------------------------------------------------------------------
// Derived defaults — computed once at module load so renders are allocation-free.
// yearsOfExperience() is called directly (same mechanism as yearsOfExperienceNode)
// so the plain-text meta description is always driven by the same utility.
// Meta tags only accept strings, so the node variant is not used here.
// ---------------------------------------------------------------------------
const DEFAULT_TITLE = `${RESUME.name} | ${RESUME.position.trim()}`;

const _industryExp   = yearsOfExperience().trim();
const _freelanceExp  = yearsOfExperience(new Date(2012, 2, 1), CAREER_START_DATE).trim();
const DEFAULT_DESCRIPTION = `With ${_industryExp} of industry experience and ${_freelanceExp} of freelancing expertise, I bring a strong technical background in frontend development, hybrid mobile applications, and backend services. I specialize in architecting scalable React-based micro-frontend systems, engineering robust backend APIs with Node.js, Python, and Django, and leading cross-functional teams across the full software development lifecycle — from system design and data pipeline development to pixel-perfect UI delivery. A holder of two patents, I have a proven track record of translating complex technical challenges into high-quality, production-grade solutions across fintech, retail, life sciences, and gaming domains.`;

const OG_IMAGE = gravatar(500);   // 500 px square for social previews

interface SEOProps {
  /** Override the page <title> and og:title / twitter:title.
   *  Defaults to "Name | Position". */
  title?: string;
  /** Override the meta description and og/twitter description.
   *  Defaults to RESUME.description. */
  description?: string;
  /** Override the canonical og:url.
   *  Defaults to the SITE_URL constant. */
  url?: string;
}

/**
 * SEO — injects <title> and social meta tags into <head> via react-helmet-async.
 *
 * Usage (home):    <SEO />
 * Usage (resume):  <SEO title="Vikram Sangat | Resume" />
 */
const SEO = ({
  title       = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  url         = SITE_URL,
}: SEOProps) => (
  <Helmet>
    {/* Primary */}
    <title>{title}</title>
    <meta name="description" content={description} />

    {/* OpenGraph */}
    <meta property="og:title"       content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type"        content="profile" />
    <meta property="og:url"         content={url} />
    <meta property="og:image"       content={OG_IMAGE} />

    {/* Twitter Card */}
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image"       content={OG_IMAGE} />
  </Helmet>
);

export default SEO;
