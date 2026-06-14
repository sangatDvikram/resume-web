import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumeProfile } from '../entities/resume-profile.entity';
import { Skill } from '../entities/skill.entity';
import { ExperienceEntry } from '../entities/experience-entry.entity';
import { EducationEntry } from '../entities/education-entry.entity';
import { Certification } from '../entities/certification.entity';
import { Award } from '../entities/award.entity';
import { Patent } from '../entities/patent.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @InjectRepository(ResumeProfile)
    private readonly profileRepo: Repository<ResumeProfile>,

    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,

    @InjectRepository(ExperienceEntry)
    private readonly expRepo: Repository<ExperienceEntry>,

    @InjectRepository(EducationEntry)
    private readonly eduRepo: Repository<EducationEntry>,

    @InjectRepository(Certification)
    private readonly certRepo: Repository<Certification>,

    @InjectRepository(Award)
    private readonly awardRepo: Repository<Award>,

    @InjectRepository(Patent)
    private readonly patentRepo: Repository<Patent>,

    private readonly config: ConfigService,
  ) {}

  // ── ISR revalidation ──────────────────────────────────────────────────────

  /**
   * Fire-and-forget POST to Next.js /api/revalidate.
   * Errors are logged but never thrown — a failed revalidation should not
   * break the mutation response.
   */
  private async revalidate(tags: string[] = ['resume']): Promise<void> {
    const revalidateUrl = this.config.get<string>('NEXT_REVALIDATE_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');

    if (!revalidateUrl || !secret) {
      this.logger.warn(
        'NEXT_REVALIDATE_URL or REVALIDATE_SECRET not set — skipping ISR revalidation.',
      );
      return;
    }

    try {
      const res = await fetch(revalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, secret }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        this.logger.warn(
          `ISR revalidation returned ${res.status} for tags: ${tags.join(', ')}`,
        );
      } else {
        this.logger.log(`ISR revalidated: ${tags.join(', ')}`);
      }
    } catch (err) {
      this.logger.error('ISR revalidation fetch failed', err);
    }
  }

  // ── Computed helpers ──────────────────────────────────────────────────────

  /** Returns "8+" style string from a career start date. */
  computeYearsOfExperience(careerStartDate: Date): string {
    const years = new Date().getFullYear() - careerStartDate.getFullYear();
    return `${years}+`;
  }

  // ── GET /v1/resume/:slug ──────────────────────────────────────────────────

  async getResume(slug: string): Promise<ResumeResponseDto> {
    const profile = await this.profileRepo.findOne({ where: { slug } });

    if (!profile) {
      throw new NotFoundException(
        `Resume profile '${slug}' not found. Run the seed first.`,
      );
    }

    const profileFilter = { profile: { id: profile.id } };

    const [skills, experience, education, certifications, awards, patents] =
      await Promise.all([
        this.skillRepo.find({ order: { category: 'ASC', name: 'ASC' } }),
        this.expRepo.find({
          where: profileFilter,
          relations: ['skills'],
          order: { sortOrder: 'ASC' },
        }),
        this.eduRepo.find({
          where: profileFilter,
          order: { sortOrder: 'ASC' },
        }),
        this.certRepo.find({
          where: profileFilter,
          order: { sortOrder: 'ASC' },
        }),
        this.awardRepo.find({
          where: profileFilter,
          order: { sortOrder: 'ASC' },
        }),
        this.patentRepo.find({
          where: profileFilter,
          order: { sortOrder: 'ASC' },
        }),
      ]);

    return {
      profile: {
        ...profile,
        yearsOfExperienceString: this.computeYearsOfExperience(
          profile.careerStartDate,
        ),
      },
      skills,
      experience,
      education,
      certifications,
      awards,
      patents,
    };
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(dto: UpdateProfileDto): Promise<ResumeProfile> {
    const profile = await this.profileRepo.findOne({
      where: { slug: 'default' },
    });
    if (!profile) throw new NotFoundException('Resume profile not found.');
    Object.assign(profile, dto);
    const saved = await this.profileRepo.save(profile);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  // ── Skills ────────────────────────────────────────────────────────────────

  async findAllSkills(): Promise<Skill[]> {
    return this.skillRepo.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  async createSkill(dto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepo.create(dto);
    const saved = await this.skillRepo.save(skill);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async updateSkill(id: string, dto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new NotFoundException(`Skill ${id} not found.`);
    Object.assign(skill, dto);
    const saved = await this.skillRepo.save(skill);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async deleteSkill(id: string): Promise<void> {
    const result = await this.skillRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Skill ${id} not found.`);
    void this.revalidate(['resume', 'resume-default']);
  }

  // ── Experience ────────────────────────────────────────────────────────────

  async findAllExperience(): Promise<ExperienceEntry[]> {
    return this.expRepo.find({
      relations: ['skills'],
      order: { sortOrder: 'ASC' },
    });
  }

  async createExperience(dto: CreateExperienceDto): Promise<ExperienceEntry> {
    const skills = dto.skillIds?.length
      ? await this.skillRepo.findByIds(dto.skillIds)
      : [];
    const entry = this.expRepo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      skills,
    });
    const saved = await this.expRepo.save(entry);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async updateExperience(
    id: string,
    dto: UpdateExperienceDto,
  ): Promise<ExperienceEntry> {
    const entry = await this.expRepo.findOne({
      where: { id },
      relations: ['skills'],
    });
    if (!entry) throw new NotFoundException(`ExperienceEntry ${id} not found.`);

    if (dto.skillIds !== undefined) {
      entry.skills = dto.skillIds.length
        ? await this.skillRepo.findByIds(dto.skillIds)
        : [];
    }

    Object.assign(entry, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.company !== undefined && { company: dto.company }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.startDate !== undefined && {
        startDate: new Date(dto.startDate),
      }),
      ...(dto.endDate !== undefined && {
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      }),
      ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
      ...(dto.tasks !== undefined && { tasks: dto.tasks }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
    });

    const saved = await this.expRepo.save(entry);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async deleteExperience(id: string): Promise<void> {
    const result = await this.expRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`ExperienceEntry ${id} not found.`);
    void this.revalidate(['resume', 'resume-default']);
  }

  // ── Education ─────────────────────────────────────────────────────────────

  async findAllEducation(): Promise<EducationEntry[]> {
    return this.eduRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async createEducation(dto: CreateEducationDto): Promise<EducationEntry> {
    const entry = this.eduRepo.create(dto);
    const saved = await this.eduRepo.save(entry);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async updateEducation(
    id: string,
    dto: UpdateEducationDto,
  ): Promise<EducationEntry> {
    const entry = await this.eduRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`EducationEntry ${id} not found.`);
    Object.assign(entry, dto);
    const saved = await this.eduRepo.save(entry);
    void this.revalidate(['resume', 'resume-default']);
    return saved;
  }

  async deleteEducation(id: string): Promise<void> {
    const result = await this.eduRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`EducationEntry ${id} not found.`);
    void this.revalidate(['resume', 'resume-default']);
  }
}
