/**
 * Seed data — canonical source of truth for all portfolio content.
 * Sourced from resume/resume.tex (Vikram Sangat).
 *
 * Usage:
 *   yarn workspace api seed
 */

import { SkillCategory } from '../entities/enums';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const PROFILE_SEED = {
  slug: 'default',
  name: 'Vikram Sangat',
  position: 'Senior Software Engineer',
  description:
    'With 10 years of industry experience and 4 years of freelancing expertise, I bring a strong technical background in frontend development, hybrid mobile applications, and backend services. I specialise in architecting scalable React-based micro-frontend systems, engineering robust backend APIs with Node.js, Python, and Django, and leading cross-functional teams across the full software development lifecycle — from system design and data pipeline development to pixel-perfect UI delivery. I am proficient with agentic AI platforms and AI-assisted development tools including Augment and Claude Code, leveraging them to accelerate delivery, improve code quality, and integrate LLM-powered capabilities into production applications. A holder of two patents, I have a proven track record of translating complex technical challenges into high-quality, production-grade solutions across fintech, retail, life sciences, and gaming domains.',
  email: 'v.sangat98@gmail.com',
  phone: '+91-9503415652',
  location: 'Bangalore, India',
  linkedInUrl: 'https://www.linkedin.com/in/sangatdvikram',
  githubUrl: 'https://github.com/sangatDvikram',
  websiteUrl: 'https://github.com/sangatDvikram',
  /** Falls back to /profile.jpeg served by Next.js public dir */
  avatarUrl: '/profile.jpeg',
  /** Earliest role: Co-Founder @ Vritt, June 2016 */
  careerStartDate: new Date('2016-06-01'),
  /** 4 years of freelancing prior to industry career */
  freelanceStartDate: new Date('2012-03-01'),
};

// ─── Skills ───────────────────────────────────────────────────────────────────

export const SKILLS_SEED: Array<{ name: string; category: SkillCategory }> = [
  // Languages
  { name: 'JavaScript', category: SkillCategory.language },
  { name: 'TypeScript', category: SkillCategory.language },
  { name: 'Python', category: SkillCategory.language },
  { name: 'Dart', category: SkillCategory.language },
  { name: 'PHP', category: SkillCategory.language },
  { name: 'C#', category: SkillCategory.language },
  { name: 'Java', category: SkillCategory.language },
  { name: 'HTML', category: SkillCategory.language },
  { name: 'CSS', category: SkillCategory.language },

  // Frameworks & Libraries
  { name: 'React', category: SkillCategory.framework },
  { name: 'Redux', category: SkillCategory.framework },
  { name: 'RxJS', category: SkillCategory.framework },
  { name: 'Next.js', category: SkillCategory.framework },
  { name: 'Node.js', category: SkillCategory.framework },
  { name: 'Express', category: SkillCategory.framework },
  { name: 'NestJS', category: SkillCategory.framework },
  { name: 'Django', category: SkillCategory.framework },
  { name: 'Flutter', category: SkillCategory.framework },
  { name: 'D3.js', category: SkillCategory.framework },
  { name: 'Single-SPA', category: SkillCategory.framework },
  { name: 'Material-UI', category: SkillCategory.framework },
  { name: 'Tailwind CSS', category: SkillCategory.framework },
  { name: 'Bootstrap', category: SkillCategory.framework },
  { name: 'CodeIgniter', category: SkillCategory.framework },
  { name: '.NET', category: SkillCategory.framework },

  // Databases
  { name: 'PostgreSQL', category: SkillCategory.database },
  { name: 'MongoDB', category: SkillCategory.database },
  { name: 'MySQL', category: SkillCategory.database },
  { name: 'Elasticsearch', category: SkillCategory.database },
  { name: 'Redis', category: SkillCategory.database },

  // Tools & Platforms
  { name: 'Docker', category: SkillCategory.tool },
  { name: 'AWS', category: SkillCategory.tool },
  { name: 'Azure', category: SkillCategory.tool },
  { name: 'Git', category: SkillCategory.tool },
  { name: 'GitHub Actions', category: SkillCategory.tool },
  { name: 'Webpack 5', category: SkillCategory.tool },
  { name: 'Module Federation', category: SkillCategory.tool },
  { name: 'Vite', category: SkillCategory.tool },
  { name: 'Storybook', category: SkillCategory.tool },
  { name: 'GraphQL', category: SkillCategory.tool },
  { name: 'REST API', category: SkillCategory.tool },
  { name: 'Augment', category: SkillCategory.tool },
  { name: 'Claude Code', category: SkillCategory.tool },
];

// ─── Experience ───────────────────────────────────────────────────────────────

export const EXPERIENCE_SEED = [
  {
    title: 'Senior Software Engineer - Frontend',
    company: 'Tekion',
    location: 'Bangalore, India',
    startDate: new Date('2022-12-01'),
    endDate: null,
    isCurrent: true,
    sortOrder: 0,
    tasks: [
      'Leading and mentoring a team of frontend engineers, establishing code standards and driving delivery of high-performance, scalable React applications.',
      'Architected a Webpack 5 monorepo from the ground up, enforcing module federation boundaries that eliminated cross-team dependency conflicts and cut build times significantly.',
      'Owned the full frontend lifecycle of DRP Onboarding modules — from component design and Redux state architecture to performance profiling and production release.',
      'Integrated agentic AI tools — Augment and Claude Code — into daily engineering workflows, accelerating feature delivery and improving code quality at scale.',
    ],
    techStack: [
      'React',
      'Redux',
      'TypeScript',
      'Webpack 5',
      'Module Federation',
      'Augment',
      'Claude Code',
    ],
  },
  {
    title: 'Senior Software Engineer - UI',
    company: 'Visa',
    location: 'Bangalore, India',
    startDate: new Date('2021-12-01'),
    endDate: new Date('2022-11-30'),
    isCurrent: false,
    sortOrder: 1,
    tasks: [
      'Led frontend development of the Merchant Onboarding application, delivering pixel-perfect, accessible UI components consumed by multiple downstream teams.',
      'Architected a micro-frontend shell using Single-SPA and RxJS-driven inter-app communication, enabling independent deployment of six product teams.',
      'Built and published a shared UI component library integrated into the Rapid Seller Onboarding Platform, cutting per-feature UI development effort by 40%.',
      'Integrated backend APIs from ThreatMatrix, Giact, and Experian directly into the React layer, handling async state, error boundaries, and retry logic for KYC compliance flows.',
    ],
    techStack: [
      'React',
      'Redux',
      'TypeScript',
      'Single-SPA',
      'RxJS',
      'Material-UI',
    ],
  },
  {
    title: 'Web Full Stack Developer',
    company: 'DMart Labs (Avenue Supermarkets Ltd)',
    location: 'Bangalore, India',
    startDate: new Date('2019-10-01'),
    endDate: new Date('2021-11-30'),
    isCurrent: false,
    sortOrder: 2,
    tasks: [
      'Designed and implemented a Single-SPA micro-frontend architecture that decoupled six React applications, enabling independent CI/CD pipelines per team.',
      'Authored an internal Application Development SDK and component library from scratch, reducing new feature delivery time by 50% across all frontend squads.',
      'Built a Node.js framework library exposing a unified API for HTTP networking, push notifications, and cross-app event streaming via RxJS observables.',
      'Developed a Flutter and React-based hybrid mobile application for in-store operations, shipped to Android and iOS with a shared business-logic layer.',
    ],
    techStack: [
      'React',
      'Redux',
      'TypeScript',
      'Node.js',
      'Single-SPA',
      'RxJS',
      'Flutter',
      'Material-UI',
    ],
  },
  {
    title: 'Software Engineer - Frontend',
    company: 'Innoplexus Consulting Services Pvt Ltd',
    location: 'Pune, India',
    startDate: new Date('2017-11-01'),
    endDate: new Date('2019-10-31'),
    isCurrent: false,
    sortOrder: 3,
    tasks: [
      'Led a team of 2–3 engineers to build client-facing data analytics dashboards in React with D3.js, delivering complex patent and biomedical visualisations.',
      'Designed and built RESTful API services using Express and Django, backed by Elasticsearch and MongoDB, supporting full-text search across millions of patent documents.',
      'Engineered Python data pipelines with Pandas to compute Simple and Extended Patent Family statistics, processing large-scale document corpora with optimised MongoDB aggregations.',
      'Collaborated directly with clients to translate analytical requirements into interactive dashboard features, accelerating insight delivery and strategic decision-making.',
    ],
    techStack: [
      'React',
      'D3.js',
      'Node.js',
      'Express',
      'Django',
      'Elasticsearch',
      'MongoDB',
      'Python',
    ],
  },
  {
    title: 'Co-Founder',
    company: 'Pole8',
    location: 'Nagpur, India',
    startDate: new Date('2017-06-01'),
    endDate: new Date('2017-11-30'),
    isCurrent: false,
    sortOrder: 4,
    tasks: [
      'Built a full-stack Django and PostgreSQL application to ingest and visualise geotagged infrastructure data on an interactive Leaflet.js map with geospatial clustering.',
      'Developed an Android application in Java that captures geotagged images via GPS and syncs data to the Django REST backend in real time.',
    ],
    techStack: ['Django', 'PostgreSQL', 'Python', 'Java', 'REST API'],
  },
  {
    title: 'Co-Founder',
    company: 'Vritt',
    location: 'Nagpur, India',
    startDate: new Date('2016-06-01'),
    endDate: new Date('2017-06-30'),
    isCurrent: false,
    sortOrder: 5,
    tasks: [
      'Integrated Stanford NER, NLTK, and Polyglot into a Django NLP pipeline for named-entity recognition and keyword extraction across multilingual news corpora.',
      'Built Python crawlers consuming RSS and HTML sources to automate ingestion and deduplication into PostgreSQL; shipped a responsive Semantic UI frontend with entity timelines.',
    ],
    techStack: ['Django', 'PostgreSQL', 'Python'],
  },
];

// ─── Education ────────────────────────────────────────────────────────────────

export const EDUCATION_SEED = [
  {
    degree: 'Bachelor of Engineering, Computer Science',
    university: 'Jhulelal Institute Of Technology, Nagpur',
    duration: '2008 – 2012',
    sortOrder: 0,
  },
  {
    degree: 'Master of Technology, CS and IT (Completed coursework)',
    university: 'Vishwakarma Institute of Technology, Pune',
    duration: '2013 – 2015',
    sortOrder: 1,
  },
];

// ─── Patents ──────────────────────────────────────────────────────────────────

export const PATENTS_SEED = [
  {
    link: 'GB2572361A',
    url: 'https://patents.google.com/patent/GB2572361A',
    title: 'System and method for determining allocation of sales force',
    sortOrder: 0,
  },
  {
    link: 'USD870129S1',
    url: 'https://patents.google.com/patent/USD870129S1',
    title: 'Display screen with transitional graphical user interface',
    sortOrder: 1,
  },
];

// ─── Certifications ───────────────────────────────────────────────────────────

export const CERTIFICATIONS_SEED = [
  {
    title: 'Certified Blockchain Developer',
    issuer: 'Blockchain Council',
    link: 'https://www.blockchain-council.org/certifications/certified-blockchain-developer/',
    sortOrder: 0,
  },
];

// ─── Awards ───────────────────────────────────────────────────────────────────

export const AWARDS_SEED = [
  {
    title: 'Jedi Knight for versatile performance',
    issuer: 'Innoplexus Consulting Services Pvt Ltd',
    sortOrder: 0,
  },
  {
    title: 'Mentored in PyCamp 2K17',
    issuer: 'PyCamp 2K17 - Nagpur',
    sortOrder: 1,
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const PROJECTS_SEED = [
  {
    slug: 'a3-acp',
    title: 'A3 Ultimate Account Control Panel',
    company: 'A3 Ultimate Games',
    role: 'Full-Stack Developer',
    startDate: new Date('2014-01-01'),
    endDate: new Date('2016-01-01'),
    description:
      'Architected a full-stack web application using CodeIgniter (PHP) and MySQL/MSSQL with a self-service portal for account management, inventory, and purchase history. ' +
      'Integrated PayPal and PayU Money payment gateways end-to-end, including server-side verification, webhook handling, and a multi-user blogging module with RBAC.',
    githubUrl: 'https://github.com/sangatDvikram/a3-acp',
    liveDemoUrl: null,
    featured: true,
    published: true,
    sortOrder: 0,
    techStack: ['PHP', 'MySQL', 'Bootstrap', 'CodeIgniter'],
  },
  {
    slug: 'a3-updater',
    title: 'A3 Ultimate Game Client Updater',
    company: 'A3 Ultimate Games',
    role: 'Developer',
    startDate: new Date('2014-06-01'),
    endDate: new Date('2015-06-01'),
    description:
      'Engineered a C# desktop application that fetches incremental patch manifests from a remote server and applies binary diffs on the fly, delivering seamless game updates without full client reinstallation. ' +
      'Implemented MD5 checksum generation and verification for every patch file, ensuring data integrity and preventing corrupted or tampered updates from being applied to the client.',
    githubUrl: 'https://github.com/sangatDvikram/A3-Client-Updater',
    liveDemoUrl: null,
    featured: false,
    published: true,
    sortOrder: 1,
    techStack: ['C#', '.NET'],
  },
  {
    slug: 'transwise',
    title: 'Transwise — Car & Driver Rental Platform',
    company: 'Tiru Ghisewad - Transwise',
    role: 'Full-Stack Developer',
    startDate: new Date('2015-01-01'),
    endDate: new Date('2016-01-01'),
    description:
      'Built a full-stack car and driver rental platform using CodeIgniter and MySQL, covering booking management, driver scheduling, and an admin dashboard for fleet operations. ' +
      'Implemented server-side receipt and tax calculation engine, automated trip-completion email notifications via PHP Mailer, and a printable invoice renderer for both customers and administrators.',
    githubUrl: 'https://github.com/sangatDvikram/transwise-client-app',
    liveDemoUrl: null,
    featured: true,
    published: true,
    sortOrder: 2,
    techStack: ['PHP', 'MySQL', 'Bootstrap', 'CodeIgniter'],
  },
];

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const BLOG_TAGS_SEED = [
  'Food Safety',
  'Public Health',
  'Food Supply Chain',
  'FSSAI',
  'Guest Post',
];

export const BLOG_POSTS_SEED = [
  {
    title: 'Food Safety: A Shared Responsibility',
    excerpt:
      "From a farmer's field to our dining table, food passes through many hands — and safety is only as strong as the weakest link in that chain.",
    coverImageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=2400&h=1350',
    published: true,
    publishedAt: new Date('2026-07-21'),
    tags: [
      'Food Safety',
      'Public Health',
      'Food Supply Chain',
      'FSSAI',
      'Guest Post',
    ],
    rawMarkdown: `*Guest post by Dilip T. Sangat, retired Assistant Commissioner of Food.*

Food safety is rarely thought of as a chain — but that's exactly what it is. "From a farmer's field to our dining table, food passes through many hands," and every one of those hands carries a share of the responsibility. A single weak link, at any point along that chain, is enough to put public health at risk.

## Six links, one chain

**Farmers** sit at the start of the chain. Following Good Agricultural Practices (GAP) — safe pesticide use, clean irrigation water, proper harvest handling — determines the baseline quality of everything that follows.

**Processors** take raw produce and turn it into packaged food. This is where HACCP (Hazard Analysis and Critical Control Points) standards and strict plant hygiene matter most, since contamination introduced here scales to every unit that ships.

**Transporters and storage facilities** are the connective tissue of the chain. Preserving the cold chain — keeping perishables within safe temperature ranges from warehouse to shelf — is a quiet but critical responsibility that's easy to overlook until it fails.

**Government and FSSAI** set the rules of the game: regulations, licensing, and inspections that give every other link something to be held to.

**Retailers** are the last checkpoint before food reaches a household. Proper storage conditions and active monitoring of expiry dates catch problems before they become someone's dinner.

**Consumers**, finally, close the loop. Safe handling at home is the last line of defense, and it's one every one of us controls directly.

## The 4 Cs

For that last link — what happens in our own kitchens — the guidance comes down to four habits:

- **Clean** hands and surfaces before and during food preparation
- **Cook** food thoroughly, especially meat, poultry, and eggs
- **Chill** leftovers within 2 hours to stop bacterial growth
- **Combat** cross-contamination by keeping raw and cooked food separate

None of these require special equipment or expertise — just consistency.

## Why it matters

In 2013, 23 children died in Bihar after a mid-day school meal was cooked in oil that had been stored in a container previously used for pesticide. It wasn't a failure of farming, or processing, or regulation in the abstract — it was a single lapse in storage practice, at one point in the chain, with irreversible consequences.

That's the core message worth carrying forward: food safety isn't any one group's job. It's a shared responsibility, and it only works when every link — farmer, processor, transporter, regulator, retailer, and consumer — holds up their end.`,
  },
];

// ─── Gallery (photos) ─────────────────────────────────────────────────────────

export const DEFAULT_ALBUM = {
  slug: 'general',
  name: 'General',
  description: 'A selection of hobby photography.',
  location: null as string | null,
  published: true,
  sortOrder: 0,
};

export const PHOTOS_SEED = [
  {
    title: 'Misty Mountains',
    location: 'Scottish Highlands',
    originalUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
    sortOrder: 0,
  },
  {
    title: 'City Lights',
    location: 'Urban',
    originalUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600',
    sortOrder: 1,
  },
  {
    title: 'Golden Hour',
    location: 'Park',
    originalUrl:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600',
    sortOrder: 2,
  },
  {
    title: 'Forest Path',
    location: 'Forest',
    originalUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600',
    sortOrder: 3,
  },
  {
    title: 'Ocean Sunset',
    location: 'Beach',
    originalUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600',
    sortOrder: 4,
  },
  {
    title: 'Architecture',
    location: 'City',
    originalUrl:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=2400&h=1800',
    thumbUrl:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600',
    sortOrder: 5,
  },
];
