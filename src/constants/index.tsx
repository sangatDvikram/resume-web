import React from "react";
/**
 * Consolidated Constants File
 * 
 * This file serves as the single source of truth for all application constants,
 * preparing the data structure for Oat UI migration.
 * 
 * Merged from: variables.ts, resume.ts, colors.ts, date.ts
 */

import { format, isValid, lastDayOfMonth, intervalToDuration } from "date-fns";

// ============================================================================
// UTILITY FUNCTIONS (from date.ts)
// ============================================================================

const formatNumberSuffix = (n: number, inputString: string): string => {
  return inputString + (n > 1 ? "s" : "");
};

export const CAREER_START_DATE = new Date(2016, 6, 1);

export const yearsOfExperience = (
  startDate = CAREER_START_DATE,
  endDate = new Date()
): string => {
  const difference = intervalToDuration({
    start: startDate,
    end: endDate,
  });

  const months = `${difference.months} ${formatNumberSuffix(
    difference.months as number,
    "month"
  )}`;
  return `${difference.years} ${formatNumberSuffix(
    difference.years as number,
    "year"
  )} ${(difference.months as number) > 0 ? months : ""} `;
};

/**
 * React.ReactNode variant of yearsOfExperience.
 * Wraps the numeric year and month values in a bold, primary-coloured <strong>
 * so they stand out visually when rendered inside JSX.
 *
 * Usage:
 *   <p>With {yearsOfExperienceNode()} of industry experience…</p>
 */
export const yearsOfExperienceNode = (
  startDate = CAREER_START_DATE,
  endDate   = new Date()
): React.ReactNode => {
  const difference = intervalToDuration({ start: startDate, end: endDate });
  const years  = difference.years  as number;
  const months = difference.months as number;

  return (
    <>
      <strong className="font-bold text-primary">{years}</strong>
      {' '}{formatNumberSuffix(years, 'year')}
      {months > 0 && (
        <>
          {' '}
          <strong className="font-bold text-primary">{months}</strong>
          {' '}{formatNumberSuffix(months, 'month')}
        </>
      )}
      {' '}
    </>
  );
};

export const calculateDuration = (data: { duration: [Date, Date]; isCurrent?: boolean }): string => {
  const { duration, isCurrent = false } = data;
  const lastDay = lastDayOfMonth(duration[1]);

  let dateFormat = format(duration[0], "MMMM yyyy");
  if (!isCurrent && isValid(lastDay)) {
    dateFormat += ` - ${format(lastDay, "MMMM yyyy")}`;
  }
  if (isCurrent) {
    dateFormat += " - Present";
  }

  return dateFormat;
};

// ============================================================================
// COLORS (from colors.ts)
// ============================================================================

export const BLACK_BACKGROUND = '#1B1C1D';
export const WHITE = '#fff';

// ============================================================================
// EXTERNAL URLS & GRAVATAR (from variables.ts)
// ============================================================================

export const LINKEDIN_URL = "https://www.linkedin.com/in/sangatdvikram/";
export const URL = "https://sangatdvikram.vercel.app/";
export const GITHUB_URL = "https://github.com/sangatDvikram";
export const GRAVATAR = "https://www.gravatar.com/avatar/7384e1fc27b2c82cc01ab728f681f326";
export const PATENT_ONE = "https://patents.google.com/patent/GB2572361A";
export const PATENT_TWO = "https://patents.google.com/patent/USD870129S1";
export const A3ACP = "https://github.com/sangatDvikram/a3-acp";
export const TRANSWISE = "https://github.com/sangatDvikram/transwise-client-app";
export const A3Udater = "https://github.com/sangatDvikram/A3-Client-Updater";
export const BLOCKCHAIN = "https://www.credential.net/56729257-fa68-446f-a156-11b6de00f5e4#gs.9q3r7k";

/**
 * Generate gravatar URL with specified size
 */
export const gravatar = (size = 200): string => `${GRAVATAR}?s=${size}`;

// ============================================================================
// PROFILE DATA (from variables.ts)
// ============================================================================

export const PROFILE = {
  name: "Vikram Dilip Sangat",
  title: "Senior Software Engineer - React | Python | Node.js | Flutter",
  description: `With ${yearsOfExperience()} of industry experience and ${yearsOfExperience(new Date(2012, 2, 1), CAREER_START_DATE)} of freelancing expertise, I bring a strong technical background in frontend development, hybrid mobile applications, and backend services. Beyond coding, I excel in leading and managing development teams throughout the software lifecycle, ensuring high-quality delivery and innovation. My experience includes developing mobile applications and data analysis dashboards, where I also secured multiple patents for my contributions. Passionate about cutting-edge technologies and scalable solutions, I am eager to explore diverse opportunities in application development—from architecture design to hands-on development.`,
  favicon: {
    url: `${GRAVATAR}?s=500`,
  },
  contact_details: [
    { type: "phone", details: "+919503415652", link: "tel:+919503415652" },
    { type: "email", details: "v.sangat98@gmail.com", link: "mailto:v.sangat98@gmail.com" },
    { type: "location", details: "Bangalore, India" },
    { type: "linkedIn", link: LINKEDIN_URL },
    { type: "github", link: GITHUB_URL },
    { type: "website", link: URL },
  ],
};

// ============================================================================
// UI/THEME CONSTANTS (from variables.ts)
// ============================================================================

export const PRIMARY_COLOR = "#35baf6";
export const PRIMARY_COLOR_LIGHT = "#b3e5fc";
export const PRIMARY_COLOR_DARK = "#03a9f4";
export const PRIMARY_COLOR_DARKER = "#0276aa";
export const PRIMARY_FONT = "Lato";

// Legacy PDF constants (kept for reference, values simplified)
export const PAGE_WIDTH = "8.3in";
export const PAGE_HEIGHT = "11.7in";
export const PAGE_PADDING_PT = "24pt";
export const PAGE_FONT_SIZE = "12pt";

export enum KEYMAPPING {
  name = "profile.name",
  title = "profile.title",
  description = "profile.description",
  favicon = "profile.favicon.url",
  patents = "patents",
  contact_details = "profile.contact_details",
}

// ============================================================================
// RESUME DATA (from resume.ts) - Part 1
// ============================================================================

export const RESUME = {
  name: "Vikram Sangat",
  position: "Senior Software Engineer - React | JavaScript | Node.js | Python | Flutter",
  description: `With ${yearsOfExperience()} of industry experience and ${yearsOfExperience(new Date(2012, 2, 1), CAREER_START_DATE)} of freelancing expertise, I bring a strong technical background in frontend development, hybrid mobile applications, and backend services. I specialize in architecting scalable React-based micro-frontend systems, engineering robust backend APIs with Node.js, Python, and Django, and leading cross-functional teams across the full software development lifecycle — from system design and data pipeline development to pixel-perfect UI delivery. A holder of two patents, I have a proven track record of translating complex technical challenges into high-quality, production-grade solutions across fintech, retail, life sciences, and gaming domains.`,
  highlights: [
    {
      icon: "💻",
      title: "Frontend Mastery",
      description: "Architecting micro-frontend systems with React, Single-SPA, and Webpack 5 Module Federation",
    },
    {
      icon: "📦",
      title: "Backend Expertise",
      description: "Building RESTful APIs and data pipelines with Node.js, Django, Express, and Python",
    },
    {
      icon: "👥",
      title: "Team Leadership",
      description: "Mentoring engineers, establishing code standards, and owning delivery across the SDLC",
    },
    {
      icon: "🏅",
      title: "Innovation",
      description: "Two patents granted; SDKs and component libraries that cut development effort by up to 50%",
    },
  ],
  profile: PROFILE,
  address: "Bangalore, India",
  gravatar: gravatar(200),
  avatar: gravatar(400),
  github: GITHUB_URL,
  email: "v.sangat98@gmail.com",
  linkedIn: LINKEDIN_URL,
  mobile: "+91-9503415652",
  navItems: [
    { href: "#overview",  label: "About" },
    { href: "#patents",   label: "Patents" },
    { href: "#hobbies",   label: "Hobbies" },
    { href: "#experience",label: "Experience" },
    { href: "#skills",    label: "Skills" },
    { href: "#education", label: "Education" },
    { href: "#freelance", label: "Projects" },
  ],
  languages: ["Python", "JavaScript", "HTML", "CSS", "Dart", "PHP", "C#"],
  frameworks: [
    "D3.js", "Django", "Express", "Flutter", "Node.js",
    "Next.js", "React", "Redux", "RxJS", "TypeScript",
  ],
  databases: ["Elasticsearch", "MongoDB", "PostgreSQL", "MySQL"],
  tools: ["Visual Studio Code", "Android Studio", "Postman", "git"],
  patents: [
    {
      link: "GB2572361A",
      url: PATENT_ONE,
      title: "System and method for determining allocation of sales force",
    },
    {
      link: "USD870129S1",
      url: PATENT_TWO,
      title: "Display screen with transitional graphical user interface",
    },
  ],
  education: [
    {
      degree: "Bachelor of Engineering, Computer Science",
      university: "Jhulelal Institute Of Technology, Nagpur",
      duration: "2008 - 2012",
    },
    {
      degree: "Master of Technology, CS and IT",
      university: "Vishwakarma Institute of Technology, Pune",
      duration: "2013 - 2015 (Completed coursework)",
    },
  ],
  certifications: [
    {
      title: "Certified Blockchain Developer",
      issuer: "Blockchain Council",
      link: BLOCKCHAIN,
    },
  ],
  awards: [
    {
      title: "Jedi Knight for versatile performance",
      issuer: "Innoplexus Consulting Services Pvt Ltd",
    },
    {
      title: "Mentored in PyCamp 2K17",
      issuer: "PyCamp 2K17 - Nagpur",
    },
  ],
  hobbies: {
    tabs: [
      { id: "photography", label: "Photography", icon: "📷" },
      { id: "music",       label: "Music",       icon: "🎵" },
      { id: "reading",     label: "Reading",     icon: "📚" },
      { id: "anime",       label: "Anime",       icon: "📺" },
    ],
    photos: [
      { id: 1, src: "https://images.unsplash.com/photo-1777621662175-b5ebc8330eed?w=800&h=600&fit=crop", title: "Lights at Pool Table", location: "Pune" },
      { id: 2, src: "https://images.unsplash.com/photo-1777623909622-5edbe7a1b928?w=800&h=600&fit=crop", title: "Farm Time",      location: "Pune" },
      { id: 3, src: "https://images.unsplash.com/photo-1777623909354-e3d28647885d?w=800&h=600&fit=crop", title: "Jwelary",      location: "Pune" },
      { id: 4, src: "https://images.unsplash.com/photo-1777623909892-f37b93e4e856?w=800&h=600&fit=crop", title: "Retirment time",    location: "Pune" },
      { id: 5, src: "https://images.unsplash.com/photo-1777621781337-002163df20ae?w=800&h=600&fit=crop", title: "City Lights",      location: "Pune" },
      { id: 6, src: "https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?d?w=800&h=600&fit=crop", title: "Coastal Sunset", location: "Goa" },
    ],
    musicGenres: [
      { name: "Rock",       icon: "🎸", description: "Classic and alternative rock" },
      { name: "Electronic", icon: "🎧", description: "EDM and ambient sounds" },
      { name: "Jazz",       icon: "🎷", description: "Smooth jazz and fusion" },
      { name: "Classical",  icon: "🎻", description: "Orchestral and piano" },
      { name: "Indie",      icon: "🎤", description: "Independent artists" },
      { name: "World",      icon: "🌍", description: "Global and cultural music" },
    ],
    favoriteArtists: ["Pink Floyd", "Radiohead", "Hans Zimmer", "Daft Punk", "A.R. Rahman", "Coldplay"],
    bookCategories: [
      { name: "Technology",      icon: "💻", count: 25 },
      { name: "Science Fiction", icon: "🚀", count: 40 },
      { name: "Philosophy",      icon: "🧠", count: 15 },
      { name: "Biography",       icon: "📖", count: 20 },
      { name: "Self-Help",       icon: "🌱", count: 12 },
      { name: "History",         icon: "🏛️", count: 18 },
    ],
    favoriteBooks: [
      { title: "Clean Code",               author: "Robert C. Martin" },
      { title: "Sapiens",                  author: "Yuval Noah Harari" },
      { title: "The Pragmatic Programmer", author: "David Thomas" },
      { title: "1984",                     author: "George Orwell" },
      { title: "Atomic Habits",            author: "James Clear" },
      { title: "The Alchemist",            author: "Paulo Coelho" },
    ],
    animeGenres: [
      { name: "Shonen",        icon: "⚔️", description: "Action-packed adventures" },
      { name: "Seinen",        icon: "🎭", description: "Mature themes and stories" },
      { name: "Sci-Fi",        icon: "🤖", description: "Futuristic worlds" },
      { name: "Thriller",      icon: "🔍", description: "Suspense and mystery" },
      { name: "Fantasy",       icon: "🐉", description: "Magical realms" },
      { name: "Slice of Life", icon: "🌸", description: "Everyday moments" },
    ],
    favoriteAnime: [
      { title: "One Piece",                          rating: "10/10" },
      { title: "Attack on Titan",                    rating: "10/10" },
      { title: "Death Note",                         rating: "10/10" },
      { title: "Naruto",                             rating: "9.5/10" },
      { title: "Fullmetal Alchemist: Brotherhood",   rating: "10/10" },
      { title: "Code Geass",                         rating: "9/10" },
      { title: "One Punch Man",                      rating: "9/10" },
    ],
  },
  experience: [
    {
      title: "Senior Software Engineer - Frontend",
      company: "Tekion",
      isCurrent: true,
      duration: [new Date(2022, 11, 12), new Date(2022, 10, 24)] as [Date, Date],
      area: "Bangalore, India",
      techStack: ["React", "Redux", "TypeScript", "Webpack 5", "Module Federation"],
      description: "",
      tasks: [
        "Leading and mentoring a team of frontend engineers, establishing code standards and driving delivery of high-performance, scalable React applications.",
        "Architected a Webpack 5 monorepo from the ground up, enforcing module federation boundaries that eliminated cross-team dependency conflicts and cut build times significantly.",
        "Owned the full frontend lifecycle of DRP Onboarding modules — from component design and Redux state architecture to performance profiling and production release.",
        "Engineered dealer and OEM onboarding and pre-onboarding workflows, reducing time-to-activation through optimised form flows and client-side validation.",
      ],
    },
    {
      title: "Senior Software Engineer - UI",
      company: "Visa",
      duration: [new Date(2021, 11, 13), new Date(2022, 10, 24)] as [Date, Date],
      area: "Bangalore, India",
      techStack: ["React", "Redux", "TypeScript", "Single-SPA", "RxJS", "Material-UI"],
      description: "",
      tasks: [
        "Led frontend development of the Merchant Onboarding application, delivering pixel-perfect, accessible UI components consumed by multiple downstream teams.",
        "Architected a micro-frontend shell using Single-SPA and RxJS-driven inter-app communication, enabling independent deployment of six product teams.",
        "Built and published a shared UI component library integrated into the Rapid Seller Onboarding Platform, cutting per-feature UI development effort by ~40%.",
        "Integrated backend APIs from ThreatMatrix, Giact, and Experian directly into the React layer, handling async state, error boundaries, and retry logic for KYC compliance flows.",
      ],
    },
    {
      title: "Web Full Stack Developer",
      company: "DMart Labs (Avenue Supermarkets Ltd)",
      duration: [new Date(2019, 9, 1), new Date(2021, 10, 25)] as [Date, Date],
      area: "Bangalore, India",
      techStack: ["React", "Redux", "TypeScript", "Node.js", "Single-SPA", "RxJS", "Flutter", "Material-UI"],
      description: "",
      tasks: [
        "Designed and implemented a Single-SPA micro-frontend architecture that decoupled six React applications, enabling independent CI/CD pipelines per team.",
        "Authored an internal Application Development SDK and component library from scratch, reducing new feature delivery time by 50% across all frontend squads.",
        "Built a Node.js framework library exposing a unified API for HTTP networking, push notifications, and cross-app event streaming via RxJS observables.",
        "Developed a Flutter and React-based hybrid mobile application for in-store operations, shipped to Android and iOS with a shared business-logic layer.",
      ],
    },
    {
      title: "Software Engineer - Frontend",
      company: "Innoplexus Consulting Services Pvt Ltd",
      duration: [new Date(2017, 10, 1), new Date(2019, 9, 1)] as [Date, Date],
      area: "Pune, India",
      description: "",
      techStack: ["React", "D3.js", "Node.js", "Express", "Django", "Elasticsearch", "MongoDB", "Python", "Pandas"],
      tasks: [
        "Led a team of 2–3 engineers to build client-facing data analytics dashboards in React with D3.js, delivering complex patent and biomedical visualisations.",
        "Designed and built RESTful API services using Express and Django, backed by Elasticsearch and MongoDB, supporting full-text search across millions of patent documents.",
        "Engineered Python data pipelines with Pandas to compute Simple and Extended Patent Family statistics, processing large-scale document corpora with optimised MongoDB aggregations.",
        "Collaborated directly with clients to translate analytical requirements into interactive dashboard features, accelerating insight delivery and strategic decision-making.",
      ],
    },
    {
      title: "Co-Founder",
      company: "Pole8",
      duration: [new Date(2017, 5, 1), new Date(2017, 10, 1)] as [Date, Date],
      area: "Nagpur, India",
      techStack: ["Django", "PostgreSQL", "Leaflet.js", "Python", "Java", "Android", "REST API"],
      description: "Platform focused towards documentation in the infrastructure industry. Aimed to reduce monitoring overhead by providing geotagged insights from given data",
      tasks: [
        "Built a full-stack Django application with a PostgreSQL backend to ingest, store, and visualise geotagged infrastructure data on an interactive Leaflet.js map.",
        "Implemented a geospatial clustering algorithm in Python that groups field images by proximity, reducing map clutter and improving data readability for site managers.",
        "Developed an Android application in Java that captures geotagged images using device GPS and compass sensors, syncing data to the Django REST backend in real time.",
      ],
    },
    {
      title: "Co-Founder",
      company: "Vritt",
      techStack: ["Semantic UI", "Django", "PostgreSQL", "Stanford-NER", "NLTK", "Polyglot", "Python"],
      duration: [new Date(2016, 5, 1), new Date(2017, 5, 1)] as [Date, Date],
      area: "Nagpur, India",
      description: "Platform for automatically extracting keywords from news and building news topical timelines to help keep track of interests of readers",
      tasks: [
        "Integrated Stanford NER, NLTK, and Polyglot into a Django NLP pipeline to perform named-entity recognition and keyword extraction across multilingual news corpora.",
        "Built Python web crawlers consuming RSS feeds and HTML sources to automate data ingestion, deduplication, and structured storage in PostgreSQL.",
        "Designed and shipped a responsive frontend using Django templates and Semantic UI, delivering entity timelines and topic trend visualisations to end users.",
      ],
    },
  ],
  projects: [
    {
      title: "A3 Ultimate Account Control Panel",
      company: "A3 Ultimate Games",
      link: A3ACP,
      techStack: ["PHP", "CodeIgniter", "MySQL", "MSSQL", "Bootstrap", "PayPal API", "PayU Money"],
      tasks: [
        "Architected and built a full-stack web application using CodeIgniter (PHP) and MySQL/MSSQL, providing players with a self-service portal for account management, inventory, and purchase history.",
        "Integrated PayPal and PayU Money payment gateways end-to-end — from server-side transaction verification and webhook handling to frontend checkout flow — enabling secure in-game item purchases.",
        "Designed and implemented a multi-user blogging module with role-based access control, rich-text authoring, and a relational comment system backed by a normalised MySQL schema.",
      ],
    },
    {
      title: "A3 Ultimate Game Client Updater",
      company: "A3 Ultimate Games",
      link: A3Udater,
      techStack: ["C#", ".NET", "MD5"],
      tasks: [
        "Engineered a C# desktop application that fetches incremental patch manifests from a remote server and applies binary diffs on the fly, delivering seamless game updates without full client reinstallation.",
        "Implemented MD5 checksum generation and verification for every patch file, ensuring data integrity and preventing corrupted or tampered updates from being applied to the client.",
      ],
    },
    {
      title: "Transwise",
      company: "Tiru Ghisewad - Transwise",
      link: TRANSWISE,
      techStack: ["PHP", "CodeIgniter", "MySQL", "Bootstrap", "PHPMailer"],
      tasks: [
        "Built a full-stack car and driver rental platform using CodeIgniter and MySQL, covering booking management, driver scheduling, and an admin dashboard for fleet operations.",
        "Implemented server-side receipt and tax calculation engine, automated trip-completion email notifications via PHP Mailer, and a printable invoice renderer for both customers and administrators.",
      ],
    },
  ],
};

// Default export for backward compatibility
export default RESUME;
