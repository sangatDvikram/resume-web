import type { NextConfig } from "next";

// ── E10-S6: Security Headers ──────────────────────────────────────────────────
// Applied to all routes. The CSP is strict but allows Cloudinary images,
// Google Fonts (if used), and the same-origin API.
const securityHeaders = [
  // Prevent browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Block this site from being loaded in an iframe (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },

  // Enable browser XSS auditing (legacy browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },

  // Only send the origin (no path) as the Referer header
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Restrict browser features
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },

  // HSTS — tell browsers to always use HTTPS (1 year, include subdomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },

  // Content Security Policy
  // - default-src: only same-origin by default
  // - img-src: allow Cloudinary, Gravatar, Unsplash
  // - script-src: only same-origin + Next.js inline scripts ('unsafe-inline'
  //               is required for Next.js hydration; nonces would be ideal)
  // - style-src: same-origin + inline (Tailwind requires this)
  // - connect-src: allow calls to the NestJS API
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://res.cloudinary.com https://www.gravatar.com https://images.unsplash.com",
      "font-src 'self'",
      "connect-src 'self' https://res.cloudinary.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Transpile the OAT UI monorepo package so Next.js / Tailwind process its source
  transpilePackages: ["@portfolio-cms/oat-ui"],

  // E10-S6: Security headers on all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      // Gravatar — used for profile avatar placeholder
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        pathname: "/avatar/**",
      },
      // Unsplash — used for seeded photography / blog cover images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Cloudinary — image uploads
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
