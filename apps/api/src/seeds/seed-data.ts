/**
 * Seed data — canonical source of truth for all portfolio content.
 *
 * This file replaces `src/constants/index.tsx` from the old Vite SPA.
 * Edit this file to update the seeded baseline for a fresh database.
 *
 * Field mappings are documented in PRD-001 §13 (Appendix).
 */

import { SkillCategory } from '../entities/enums';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const PROFILE_SEED = {
  name: 'Vikram Aruchamy',
  position: 'Senior Software Engineer',
  description:
    'Passionate full-stack engineer with 8+ years of experience building scalable web applications and distributed systems. I specialise in React, Node.js, and cloud-native architectures.',
  email: 'hello@vikramaruchamy.dev',
  phone: '+44 7XXX XXXXXX',
  location: 'London, United Kingdom',
  linkedInUrl: 'https://www.linkedin.com/in/vikramaruchamy',
  githubUrl: 'https://github.com/vikramaruchamy',
  websiteUrl: 'https://vikramaruchamy.dev',
  /** gravatar(400) — stored URL so the frontend can append ?s=<size> */
  avatarUrl: 'https://www.gravatar.com/avatar/placeholder?s=400&d=identicon',
  /** CAREER_START_DATE: new Date(2016, 6, 1) */
  careerStartDate: new Date('2016-07-01'),
  /** Freelance start: new Date(2012, 2, 1) */
  freelanceStartDate: new Date('2012-03-01'),
};

// ─── Skills ───────────────────────────────────────────────────────────────────

export const SKILLS_SEED: Array<{ name: string; category: SkillCategory }> = [
  // Languages
  { name: 'TypeScript', category: SkillCategory.language },
  { name: 'JavaScript', category: SkillCategory.language },
  { name: 'Python',     category: SkillCategory.language },
  { name: 'Java',       category: SkillCategory.language },
  { name: 'SQL',        category: SkillCategory.language },
  // Frameworks
  { name: 'React',      category: SkillCategory.framework },
  { name: 'Next.js',    category: SkillCategory.framework },
  { name: 'NestJS',     category: SkillCategory.framework },
  { name: 'Node.js',    category: SkillCategory.framework },
  { name: 'Express',    category: SkillCategory.framework },
  { name: 'Tailwind CSS', category: SkillCategory.framework },
  // Databases
  { name: 'PostgreSQL', category: SkillCategory.database },
  { name: 'MongoDB',    category: SkillCategory.database },
  { name: 'Redis',      category: SkillCategory.database },
  // Tools
  { name: 'Docker',     category: SkillCategory.tool },
  { name: 'AWS',        category: SkillCategory.tool },
  { name: 'Git',        category: SkillCategory.tool },
  { name: 'GitHub Actions', category: SkillCategory.tool },
  { name: 'Cloudinary', category: SkillCategory.tool },
];

// ─── Experience ───────────────────────────────────────────────────────────────

export const EXPERIENCE_SEED = [
  {
    title: 'Senior Software Engineer',
    company: 'Tekion Corp',
    location: 'London, UK (Remote)',
    startDate: new Date('2022-01-01'),
    endDate: null,
    isCurrent: true,
    sortOrder: 0,
    tasks: [
      'Led migration of monolithic dealer management system to microservices, reducing deployment time by 60%.',
      'Architected real-time vehicle inventory sync using Kafka and WebSockets serving 500+ dealerships.',
      'Mentored a team of 5 engineers, introducing TypeScript, code review standards and CI/CD practices.',
      'Built a configurable form engine in React that cut new feature delivery time by 40%.',
    ],
    techStack: ['TypeScript', 'React', 'Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
  },
  {
    title: 'Software Engineer',
    company: 'Cazoo',
    location: 'London, UK',
    startDate: new Date('2020-06-01'),
    endDate: new Date('2021-12-31'),
    isCurrent: false,
    sortOrder: 1,
    tasks: [
      'Built customer-facing vehicle listing and checkout flows using Next.js with SSR, achieving 95+ Lighthouse scores.',
      'Integrated third-party finance and insurance APIs into a unified checkout experience.',
      'Implemented A/B testing infrastructure reducing experiment cycle time from weeks to days.',
    ],
    techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    title: 'Full-Stack Developer',
    company: 'Accenture',
    location: 'London, UK',
    startDate: new Date('2018-09-01'),
    endDate: new Date('2020-05-31'),
    isCurrent: false,
    sortOrder: 2,
    tasks: [
      'Delivered a cloud-native insurance claims processing platform for a FTSE 100 client, reducing processing time by 35%.',
      'Built RESTful APIs in Java/Spring Boot with OAuth2 security and comprehensive unit/integration test suites.',
      'Automated CI/CD pipelines using Jenkins and Docker, achieving zero-downtime deployments.',
    ],
    techStack: ['Java', 'JavaScript', 'React', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    title: 'Junior Software Engineer',
    company: 'Sopra Steria',
    location: 'London, UK',
    startDate: new Date('2016-07-01'),
    endDate: new Date('2018-08-31'),
    isCurrent: false,
    sortOrder: 3,
    tasks: [
      'Developed internal HR self-service portal using React and .NET reducing HR ticket volume by 30%.',
      'Contributed to a UK government digital service transformation project following GDS standards.',
    ],
    techStack: ['JavaScript', 'React', 'SQL', 'Git'],
  },
];

// ─── Education ────────────────────────────────────────────────────────────────

export const EDUCATION_SEED = [
  {
    degree: 'BSc (Hons) Computer Science',
    university: 'University of Surrey',
    duration: '2012 – 2016',
    sortOrder: 0,
  },
];

// ─── Patents ──────────────────────────────────────────────────────────────────

export const PATENTS_SEED = [
  {
    link: 'GB2572361A',
    url: 'https://patents.google.com/patent/GB2572361A',
    title: 'Improvements in or Relating to Vehicle Data Management Systems',
    sortOrder: 0,
  },
  {
    link: 'USD870129S1',
    url: 'https://patents.google.com/patent/USD870129S1',
    title: 'Display Screen With Graphical User Interface for Vehicle Data',
    sortOrder: 1,
  },
];

// ─── Certifications ───────────────────────────────────────────────────────────

export const CERTIFICATIONS_SEED = [
  {
    title: 'Certified Blockchain Expert',
    issuer: 'Blockchain Council',
    link: 'https://www.blockchain-council.org/certifications/certified-blockchain-expert-training/',
    sortOrder: 0,
  },
  {
    title: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    link: null,
    sortOrder: 1,
  },
];

// ─── Awards ───────────────────────────────────────────────────────────────────

export const AWARDS_SEED = [
  {
    title: 'Hackathon Winner — Internal Innovation Challenge',
    issuer: 'Tekion Corp',
    sortOrder: 0,
  },
  {
    title: 'Employee of the Quarter',
    issuer: 'Sopra Steria',
    sortOrder: 1,
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const PROJECTS_SEED = [
  {
    slug: 'a3-acp',
    title: 'A3 ACP — Automotive Control Platform',
    company: 'Tekion Corp',
    role: 'Lead Engineer',
    startDate: new Date('2022-01-01'),
    endDate: null,
    description:
      'A configurable, role-based automotive control platform built for franchise dealerships. ' +
      'Provides real-time vehicle inventory management, customer CRM, and finance workflows.',
    githubUrl: 'https://github.com/vikramaruchamy/a3-acp',
    liveDemoUrl: null,
    featured: true,
    published: true,
    sortOrder: 0,
    techStack: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
  },
  {
    slug: 'transwise',
    title: 'Transwise — Transport Management SaaS',
    company: null,
    role: 'Full-Stack Developer',
    startDate: new Date('2021-01-01'),
    endDate: new Date('2021-12-31'),
    description:
      'A SaaS platform for managing multi-modal freight transport bookings, real-time tracking, and invoicing.',
    githubUrl: 'https://github.com/vikramaruchamy/transwise',
    liveDemoUrl: null,
    featured: true,
    published: true,
    sortOrder: 1,
    techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB'],
  },
  {
    slug: 'portfolio-cms',
    title: 'Portfolio CMS Platform',
    company: null,
    role: 'Solo Developer',
    startDate: new Date('2024-01-01'),
    endDate: null,
    description:
      'A full-stack headless CMS for managing personal portfolio content — this very site. ' +
      'Features a NestJS REST API, Next.js 15 frontend, AdminJS panel, and CI/CD via GitHub Actions.',
    githubUrl: 'https://github.com/vikramaruchamy/portfolio-cms',
    liveDemoUrl: 'https://vikramaruchamy.dev',
    featured: true,
    published: true,
    sortOrder: 2,
    techStack: ['TypeScript', 'React', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker', 'GitHub Actions'],
  },
];

// ─── Gallery (photos) ─────────────────────────────────────────────────────────

/** Default album slug — all seeded photos go here */
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
    location: 'Scottish Highlands, UK',
    originalUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
    sortOrder: 0,
  },
  {
    title: 'City Lights',
    location: 'London, UK',
    originalUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600',
    sortOrder: 1,
  },
  {
    title: 'Golden Hour',
    location: 'Richmond Park, London',
    originalUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600',
    sortOrder: 2,
  },
  {
    title: 'Forest Path',
    location: 'Epping Forest, UK',
    originalUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600',
    sortOrder: 3,
  },
  {
    title: 'Ocean Sunset',
    location: 'Bournemouth Beach, UK',
    originalUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600',
    sortOrder: 4,
  },
  {
    title: 'Architecture',
    location: 'The Shard, London',
    originalUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=2400&h=1800',
    thumbUrl:    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600',
    sortOrder: 5,
  },
];
