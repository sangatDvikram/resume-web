import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

// ── Create ────────────────────────────────────────────────────────────────────

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  excerpt?: string | null;

  @IsString()
  rawMarkdown!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  coverImageUrl?: string | null;

  /**
   * Tag names to attach to this post.
   * Each name is looked up (case-insensitive) or created if it doesn't exist.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

// ── Update ────────────────────────────────────────────────────────────────────

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  rawMarkdown?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  coverImageUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface TagDto {
  id: string;
  name: string;
}

/** Returned in list endpoints — no heavy htmlContent / rawMarkdown */
export interface BlogPostSummaryDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  readingTime: number | null;
  published: boolean;
  publishedAt: Date | null;
  tags: TagDto[];
  createdAt: Date;
  updatedAt: Date;
}

/** Returned in single-post endpoint — includes full content */
export interface BlogPostDetailDto extends BlogPostSummaryDto {
  htmlContent: string;
  rawMarkdown: string;
}
