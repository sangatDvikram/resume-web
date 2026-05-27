import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

// ── Create ────────────────────────────────────────────────────────────────────

export class CreateProjectDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  githubUrl?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  liveDemoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  /** Skill IDs to link via project_skills join table */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];
}

// ── Update ────────────────────────────────────────────────────────────────────

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  githubUrl?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  liveDemoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];
}

// ── Media sub-resource ────────────────────────────────────────────────────────

export class AddMediaDto {
  @IsUrl()
  @MaxLength(1000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReorderMediaDto {
  /** Ordered array of ProjectMedia IDs */
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

// ── Video sub-resource ────────────────────────────────────────────────────────

export class AddVideoDto {
  @IsString()
  source!: 'youtube' | 'vimeo' | 'self_hosted';

  @IsUrl()
  @MaxLength(1000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReorderVideosDto {
  /** Ordered array of ProjectVideo IDs */
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

// ── Response shapes ───────────────────────────────────────────────────────────

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
