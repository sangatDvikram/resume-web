import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Cloudinary — future image uploads via EPIC 6
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
