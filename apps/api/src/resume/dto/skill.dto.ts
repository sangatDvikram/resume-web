import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SkillCategory } from '../../entities/enums';

export class CreateSkillDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEnum(SkillCategory)
  category!: SkillCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
