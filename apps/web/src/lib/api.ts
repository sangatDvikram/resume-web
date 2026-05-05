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

// ─── Client ───────────────────────────────────────────────────────────────────

/** Base URL for server-side fetches — prefers internal network URL over public. */
function getApiBase(): string {
  // API_INTERNAL_URL is a Railway/Docker internal URL (e.g. http://api:3001)
  // that bypasses the public internet and is not exposed to the client.
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001'
  );
}

/**
 * Fetch the full resume snapshot.
 * Tagged with "resume" so `revalidateTag('resume')` can purge it on-demand.
 */
export async function getResume(): Promise<ResumeResponseDto> {
  const res = await fetch(`${getApiBase()}/v1/resume`, {
    next: { tags: ['resume'], revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch resume: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ResumeResponseDto>;
}
