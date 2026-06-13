import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @MaxLength(255)
  degree!: string;

  @IsString()
  @MaxLength(255)
  university!: string;

  @IsString()
  @MaxLength(100)
  duration!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  degree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  university?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
