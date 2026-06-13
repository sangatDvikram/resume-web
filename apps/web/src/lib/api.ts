/**
 * Typed API client for the NestJS portfolio backend.
 *
 * All functions are async and intended for use inside Server Components.
 * The internal API URL (process.env.API_INTERNAL_URL) is preferred when
 * running in the same network (e.g. Railway internal network) to avoid
 * unnecessary round-trips through the public internet.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillDto {
  id: string;
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool';
}

export interface ExperienceDto {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  tasks: string[];
  sortOrder: number;
  skills: SkillDto[];
}

export interface EducationDto {
  id: string;
  degree: string;
  university: string;
  duration: string;
  sortOrder: number;
}

export interface CertificationDto {
  id: string;
  title: string;
  issuer: string;
  link: string | null;
  sortOrder: number;
}

export interface AwardDto {
  id: string;
  title: string;
  issuer: string;
  sortOrder: number;
}

export interface PatentDto {
  id: string;
  link: string;
  url: string;
  title: string;
  sortOrder: number;
}

export interface ProfileDto {
  id: string;
  name: string;
  position: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  githubUrl: string;
  websiteUrl: string | null;
  avatarUrl: string;
  careerStartDate: string;
  freelanceStartDate: string;
  updatedAt: string;
  yearsOfExperienceString: string;
}

export interface ResumeResponseDto {
  profile: ProfileDto;
  skills: SkillDto[];
  experience: ExperienceDto[];
  education: EducationDto[];
  certifications: CertificationDto[];
  awards: AwardDto[];
  patents: PatentDto[];
}

// ─── Blog types ───────────────────────────────────────────────────────────────

export interface TagDto {
  id: string;
  name: string;
}

export interface BlogPostSummaryDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  readingTime: number | null;
  published: boolean;
  publishedAt: string | null;
  tags: TagDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDetailDto extends BlogPostSummaryDto {
  htmlContent: string;
  rawMarkdown: string;
}

// ─── Projects types ───────────────────────────────────────────────────────────

export interface ProjectMediaDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProjectVideoDto {
  id: string;
  source: 'youtube' | 'vimeo' | 'self_hosted';
  url: string;
  title: string | null;
  sortOrder: number;
}

export interface SkillRefDto {
  id: string;
  name: string;
  category: string;
}

export interface ProjectSummaryDto {
  id: string;
  slug: string;
  title: string;
  company: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  githubUrl: string | null;
  liveDemoUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  skills: SkillRefDto[];
  media: ProjectMediaDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  description: string | null;
  htmlDescription: string | null;
  videos: ProjectVideoDto[];
}

// ─── Client ───────────────────────────────────────────────────────────────────

import { ApiEndpoint } from './config';

/** Base URL for server-side fetches — prefers internal network URL over public. */
function getApiBase(): string {
  // API_INTERNAL_URL is a Railway/Docker internal URL (e.g. http://api:3001)
  // that bypasses the public internet and is not exposed to the client.
  const base =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';
  return base;
}

/**
 * Thin fetch wrapper that logs the full URL in development.
 * Logging is suppressed in production to keep output clean.
 */
function loggedFetch(url: string | URL, init?: RequestInit): ReturnType<typeof fetch> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API →] ${url.toString()}`);
  }
  return fetch(url as string, init);
}

/**
 * Fetch the full resume snapshot for the configured profile slug.
 * Slug is set via NEXT_PUBLIC_RESUME_SLUG (defaults to "default").
 * Tagged with "resume" and "resume-<slug>" for on-demand ISR revalidation.
 */
export async function getResume(): Promise<ResumeResponseDto> {
  const slug = process.env.NEXT_PUBLIC_RESUME_SLUG ?? 'default';
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.RESUME(slug)}`, {
    next: { tags: ['resume', `resume-${slug}`], revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch resume: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ResumeResponseDto>;
}

/**
 * Fetch all published blog posts (summary only — no htmlContent).
 * Tagged with "blog" so `revalidateTag('blog')` can purge it on-demand.
 */
export async function getBlogPosts(): Promise<BlogPostSummaryDto[]> {
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.BLOG}`, {
    next: { tags: ['blog'], revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blog posts: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<BlogPostSummaryDto[]>;
}

/**
 * Fetch a single published blog post by slug (includes htmlContent).
 * Tagged with "blog" and "blog-<slug>" for granular revalidation.
 */
export async function getBlogPost(slug: string): Promise<BlogPostDetailDto> {
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.BLOG_POST(slug)}`, {
    next: { tags: ['blog', `blog-${slug}`], revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blog post "${slug}": ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<BlogPostDetailDto>;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface ExifDto {
  make?: string;
  model?: string;
  focalLength?: string;
  aperture?: string;
  iso?: string | number;
  shutterSpeed?: string;
}

export interface PhotoDto {
  id: string;
  title: string | null;
  altText: string | null;
  location: string | null;
  publicId: string | null;
  originalUrl: string;
  thumbUrl: string;
  lqipUrl: string | null;
  width: number | null;
  height: number | null;
  exif: ExifDto | null;
  sortOrder: number;
  published: boolean;
  albumId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumSummaryDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  coverUrl: string | null;
  lqipUrl: string | null;
  photoCount: number;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumDetailDto extends AlbumSummaryDto {
  photos: PhotoDto[];
  nextCursor: string | null;
  total: number;
}

export interface PhotoPageDto {
  photos: PhotoDto[];
  nextCursor: string | null;
  total: number;
}

/** Fetch all published albums with cover image + photo count. */
export async function getAlbums(): Promise<AlbumSummaryDto[]> {
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.GALLERY_ALBUMS}`, {
    next: { tags: ['gallery'], revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch albums: ${res.status}`);
  return res.json() as Promise<AlbumSummaryDto[]>;
}

/** Fetch a single published album by slug (includes first page of photos). */
export async function getAlbum(slug: string, cursor?: string): Promise<AlbumDetailDto> {
  const url = new URL(`${getApiBase()}${ApiEndpoint.GALLERY_ALBUM(slug)}`);
  if (cursor) url.searchParams.set('cursor', cursor);
  const res = await loggedFetch(url, {
    next: { tags: ['gallery', `album-${slug}`], revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch album "${slug}": ${res.status}`);
  return res.json() as Promise<AlbumDetailDto>;
}

/** Fetch a paginated photo feed (optionally filtered by albumId). */
export async function getPhotos(albumId?: string, cursor?: string): Promise<PhotoPageDto> {
  const url = new URL(`${getApiBase()}${ApiEndpoint.GALLERY_PHOTOS}`);
  if (albumId) url.searchParams.set('albumId', albumId);
  if (cursor)  url.searchParams.set('cursor', cursor);
  const res = await loggedFetch(url, {
    next: { tags: ['gallery'], revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch photos: ${res.status}`);
  return res.json() as Promise<PhotoPageDto>;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/**
 * Fetch all published projects (summary only — no htmlDescription / videos).
 * Tagged with "projects" so `revalidateTag('projects')` can purge on-demand.
 */
export async function getProjects(): Promise<ProjectSummaryDto[]> {
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.PROJECTS}`, {
    next: { tags: ['projects'], revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ProjectSummaryDto[]>;
}

/**
 * Fetch a single published project by slug (includes description, videos).
 * Tagged with "projects" and "project-<slug>" for granular revalidation.
 */
export async function getProject(slug: string): Promise<ProjectDetailDto> {
  const res = await loggedFetch(`${getApiBase()}${ApiEndpoint.PROJECT(slug)}`, {
    next: { tags: ['projects', `project-${slug}`], revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch project "${slug}": ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ProjectDetailDto>;
}
