import { Helmet } from "react-helmet-async";
import { RESUME, URL as SITE_URL, gravatar } from "@/constants";

// ---------------------------------------------------------------------------
// Derived defaults — computed once at module load so renders are allocation-free.
// RESUME.description and RESUME.position may carry leading/trailing whitespace
// from the template-literal definitions in constants/index.ts, so we trim them.
// ---------------------------------------------------------------------------
const DEFAULT_TITLE       = `${RESUME.name} | ${RESUME.position.trim()}`;
const DEFAULT_DESCRIPTION = RESUME.description.trim();
const OG_IMAGE            = gravatar(500);   // 500 px square for social previews

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
