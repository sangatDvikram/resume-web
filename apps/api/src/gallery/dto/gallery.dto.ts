import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

// ── Albums ─────────────────────────────────────────────────────────────────────

export class CreateAlbumDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  coverId?: string | null;
}

// ── Photos ─────────────────────────────────────────────────────────────────────

export class UpdatePhotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  albumId?: string | null;
}

export class ReorderPhotosDto {
  /** Ordered array of Photo IDs */
  ids!: string[];
}

// ── Response shapes ────────────────────────────────────────────────────────────

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
