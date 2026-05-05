/**
 * Response shape for GET /v1/resume.
 * All properties are plain data — no TypeORM relations included at this level.
 */

export class SkillDto {
  id!: string;
  name!: string;
  category!: string;
}

export class ExperienceDto {
  id!: string;
  title!: string;
  company!: string;
  location!: string;
  startDate!: Date;
  endDate!: Date | null;
  isCurrent!: boolean;
  tasks!: string[];
  sortOrder!: number;
  skills!: SkillDto[];
}

export class EducationDto {
  id!: string;
  degree!: string;
  university!: string;
  duration!: string;
  sortOrder!: number;
}

export class CertificationDto {
  id!: string;
  title!: string;
  issuer!: string;
  link!: string | null;
  sortOrder!: number;
}

export class AwardDto {
  id!: string;
  title!: string;
  issuer!: string;
  sortOrder!: number;
}

export class PatentDto {
  id!: string;
  link!: string;
  url!: string;
  title!: string;
  sortOrder!: number;
}

export class ProfileDto {
  id!: string;
  name!: string;
  position!: string;
  description!: string;
  email!: string;
  phone!: string;
  location!: string;
  linkedInUrl!: string;
  githubUrl!: string;
  websiteUrl!: string | null;
  avatarUrl!: string;
  careerStartDate!: Date;
  freelanceStartDate!: Date;
  updatedAt!: Date;
  /** Computed: e.g. "8+" — derived from careerStartDate */
  yearsOfExperienceString!: string;
}

export class ResumeResponseDto {
  profile!: ProfileDto;
  skills!: SkillDto[];
  experience!: ExperienceDto[];
  education!: EducationDto[];
  certifications!: CertificationDto[];
  awards!: AwardDto[];
  patents!: PatentDto[];
}
