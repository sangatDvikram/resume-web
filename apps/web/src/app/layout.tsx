import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import { ThemeProvider } from "@teispace/next-themes";
import { Nav } from "./components/Nav";
import { ServiceWorkerRegistrar } from "./components/ServiceWorkerRegistrar";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Vikram Sangat",
    default: "Vikram Sangat — Senior Software Engineer",
  },
  description:
    "Portfolio of Vikram Sangat — Senior Software Engineer with 10 years of experience. Specialising in React micro-frontends, Node.js, Python, Flutter, and agentic AI. Two patent holder based in Bangalore, India.",
  keywords: [
    "Vikram Sangat",
    "Senior Software Engineer",
    "React",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Python",
    "Flutter",
    "micro-frontend",
    "Single-SPA",
    "Webpack 5",
    "Module Federation",
    "Bangalore",
    "India",
    "portfolio",
  ],
  authors: [{ name: "Vikram Sangat", url: "https://www.linkedin.com/in/sangatdvikram/" }],
  creator: "Vikram Sangat",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio.example.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vikram Sangat",
    title: "Vikram Sangat — Senior Software Engineer",
    description:
      "10 years of experience in React, Node.js, Python, and Flutter. Architect of micro-frontend systems, agentic AI integrations, and two patent holder. Bangalore, India.",
    images: [{ url: "/profile.jpeg", width: 400, height: 400, alt: "Vikram Sangat" }],
  },
  twitter: {
    card: "summary",
    title: "Vikram Sangat — Senior Software Engineer",
    description:
      "React · Node.js · Python · Flutter · Micro-frontends · Agentic AI · Two patent holder · Bangalore, India.",
    images: ["/profile.jpeg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png",   sizes: "57x57",   type: "image/png" },
      { url: "/apple-icon-60x60.png",   sizes: "60x60",   type: "image/png" },
      { url: "/apple-icon-72x72.png",   sizes: "72x72",   type: "image/png" },
      { url: "/apple-icon-76x76.png",   sizes: "76x76",   type: "image/png" },
      { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/apple-icon-precomposed.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${roboto.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <ServiceWorkerRegistrar />
          <Nav />
          {children}
          <footer className="border-t border-border py-8 mt-auto">
            <div className="section-container text-center text-sm text-muted-foreground">
              Vikram Sangat &mdash; {new Date().getFullYear()}
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
