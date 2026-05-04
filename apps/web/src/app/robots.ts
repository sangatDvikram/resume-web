import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        // Disallow admin panel from public crawlers
        disallow: "/v1/",
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio.example.com"}/sitemap.xml`,
  };
}
