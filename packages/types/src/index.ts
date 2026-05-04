// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Resume ───────────────────────────────────────────────────────────────────
export interface ResumeProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  avatarPublicId?: string;
  updatedAt: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location?: string;
  description: string;
  technologies: string[];
  order: number;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  order: number;
}

export interface SkillEntry {
  id: string;
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  order: number;
}

export interface PatentEntry {
  id: string;
  title: string;
  patentNumber: string;
  status: 'granted' | 'pending' | 'published';
  filingDate: string;
  grantDate?: string;
  url?: string;
  description: string;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: BlogPostStatus;
  tags: string[];
  coverPublicId?: string;
  coverLqipUrl?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'archived';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  status: ProjectStatus;
  featured: boolean;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  coverPublicId?: string;
  coverLqipUrl?: string;
  order: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface Album {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverPublicId?: string;
  coverLqipUrl?: string;
  photoCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  title?: string;
  description?: string;
  publicId: string;
  lqipUrl: string;
  width: number;
  height: number;
  takenAt?: string;
  order: number;
  createdAt: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export interface UploadResponse {
  publicId: string;
  secureUrl: string;
  lqipUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}
