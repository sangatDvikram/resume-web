import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectMedia } from '../entities/project-media.entity';
import { ProjectVideo } from '../entities/project-video.entity';
import { Skill } from '../entities/skill.entity';
import { VideoSource } from '../entities/enums';
import { generateSlug } from '../common/slug.util';
import { renderMarkdown } from '../common/markdown.util';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMediaDto,
  ReorderMediaDto,
  AddVideoDto,
  ReorderVideosDto,
  ProjectSummaryDto,
  ProjectDetailDto,
  ProjectMediaDto,
  ProjectVideoDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(ProjectMedia)
    private readonly mediaRepo: Repository<ProjectMedia>,

    @InjectRepository(ProjectVideo)
    private readonly videoRepo: Repository<ProjectVideo>,

    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,

    private readonly config: ConfigService,
  ) {}

  // ── ISR revalidation ──────────────────────────────────────────────────────

  private async revalidate(tags: string[] = ['projects']): Promise<void> {
    const revalidateUrl = this.config.get<string>('NEXT_REVALIDATE_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    if (!revalidateUrl || !secret) {
      this.logger.warn('NEXT_REVALIDATE_URL or REVALIDATE_SECRET not set — skipping ISR revalidation.');
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
        this.logger.warn(`ISR revalidation returned ${res.status} for tags: ${tags.join(', ')}`);
      } else {
        this.logger.log(`ISR revalidated: ${tags.join(', ')}`);
      }
    } catch (err) {
      this.logger.error('ISR revalidation fetch failed', err);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private toMediaDto(m: ProjectMedia): ProjectMediaDto {
    return { id: m.id, url: m.url, altText: m.altText, sortOrder: m.sortOrder };
  }

  private toVideoDto(v: ProjectVideo): ProjectVideoDto {
    return { id: v.id, source: v.source as ProjectVideoDto['source'], url: v.url, title: v.title, sortOrder: v.sortOrder };
  }

  private toSummaryDto(p: Project): ProjectSummaryDto {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      company: p.company,
      role: p.role,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      githubUrl: p.githubUrl,
      liveDemoUrl: p.liveDemoUrl,
      featured: p.featured,
      published: p.published,
      sortOrder: p.sortOrder,
      skills: (p.skills ?? []).map(s => ({ id: s.id, name: s.name, category: s.category })),
      media: (p.media ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map(this.toMediaDto),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  private toDetailDto(p: Project): ProjectDetailDto {
    return {
      ...this.toSummaryDto(p),
      description: p.description,
      htmlDescription: p.htmlDescription,
      videos: (p.videos ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map(this.toVideoDto),
    };
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAllPublished(): Promise<ProjectSummaryDto[]> {
    const projects = await this.projectRepo.find({
      where: { published: true },
      relations: ['skills', 'media'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return projects.map(p => this.toSummaryDto(p));
  }

  async findAll(): Promise<ProjectSummaryDto[]> {
    const projects = await this.projectRepo.find({
      relations: ['skills', 'media'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return projects.map(p => this.toSummaryDto(p));
  }

  async findBySlug(slug: string): Promise<ProjectDetailDto> {
    const project = await this.projectRepo.findOne({
      where: { slug },
      relations: ['skills', 'media', 'videos'],
    });
    if (!project) throw new NotFoundException(`Project "${slug}" not found.`);
    return this.toDetailDto(project);
  }

  async findRelated(projectId: string, skillIds: string[], limit = 3): Promise<ProjectSummaryDto[]> {
    if (!skillIds.length) return [];
    const all = await this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.skills', 'skill')
      .leftJoinAndSelect('p.media', 'media')
      .where('p.published = true')
      .andWhere('p.id != :id', { id: projectId })
      .getMany();

    const scored = all
      .map(p => ({ p, score: (p.skills ?? []).filter(s => skillIds.includes(s.id)).length }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(x => this.toSummaryDto(x.p));
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  async create(dto: CreateProjectDto): Promise<ProjectDetailDto> {
    const slug = generateSlug(dto.title);
    const htmlDescription = dto.description ? await renderMarkdown(dto.description) : null;
    const skills = dto.skillIds?.length
      ? await this.skillRepo.findBy({ id: In(dto.skillIds) })
      : [];

    const project = this.projectRepo.create({
      slug,
      title: dto.title,
      company: dto.company ?? null,
      role: dto.role ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      description: dto.description ?? null,
      htmlDescription,
      githubUrl: dto.githubUrl ?? null,
      liveDemoUrl: dto.liveDemoUrl ?? null,
      featured: dto.featured ?? false,
      published: dto.published ?? false,
      sortOrder: dto.sortOrder ?? 0,
      skills,
    });

    const saved = await this.projectRepo.save(project);
    void this.revalidate(['projects']);
    return this.toDetailDto(saved);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDetailDto> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['skills', 'media', 'videos'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found.`);

    if (dto.title       !== undefined) project.title       = dto.title;
    if (dto.company     !== undefined) project.company     = dto.company ?? null;
    if (dto.role        !== undefined) project.role        = dto.role ?? null;
    if (dto.startDate   !== undefined) project.startDate   = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate     !== undefined) project.endDate     = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.githubUrl   !== undefined) project.githubUrl   = dto.githubUrl ?? null;
    if (dto.liveDemoUrl !== undefined) project.liveDemoUrl = dto.liveDemoUrl ?? null;
    if (dto.featured    !== undefined) project.featured    = dto.featured;
    if (dto.published   !== undefined) project.published   = dto.published;
    if (dto.sortOrder   !== undefined) project.sortOrder   = dto.sortOrder;

    if (dto.description !== undefined) {
      project.description     = dto.description ?? null;
      project.htmlDescription = dto.description ? await renderMarkdown(dto.description) : null;
    }

    if (dto.skillIds !== undefined) {
      project.skills = dto.skillIds.length
        ? await this.skillRepo.findBy({ id: In(dto.skillIds) })
        : [];
    }

    const saved = await this.projectRepo.save(project);
    void this.revalidate(['projects', `project-${project.slug}`]);
    return this.toDetailDto(saved);
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found.`);
    await this.projectRepo.delete(id);
    void this.revalidate(['projects', `project-${project.slug}`]);
  }

  // ── Media sub-resource ────────────────────────────────────────────────────

  async addMedia(projectId: string, dto: AddMediaDto): Promise<ProjectMediaDto> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found.`);

    const media = this.mediaRepo.create({
      url: dto.url,
      altText: dto.altText ?? null,
      sortOrder: dto.sortOrder ?? 0,
      project,
    });
    const saved = await this.mediaRepo.save(media);
    void this.revalidate(['projects', `project-${project.slug}`]);
    return this.toMediaDto(saved);
  }

  async reorderMedia(projectId: string, dto: ReorderMediaDto): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found.`);

    await Promise.all(
      dto.ids.map((mediaId, index) =>
        this.mediaRepo.update({ id: mediaId, project: { id: projectId } }, { sortOrder: index }),
      ),
    );
    void this.revalidate(['projects', `project-${project.slug}`]);
  }

  async removeMedia(projectId: string, mediaId: string): Promise<void> {
    const result = await this.mediaRepo.delete({ id: mediaId, project: { id: projectId } });
    if (result.affected === 0) throw new NotFoundException(`Media ${mediaId} not found.`);
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (project) void this.revalidate(['projects', `project-${project.slug}`]);
  }

  // ── Video sub-resource ────────────────────────────────────────────────────

  async addVideo(projectId: string, dto: AddVideoDto): Promise<ProjectVideoDto> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found.`);

    const video = this.videoRepo.create({
      source: dto.source as VideoSource,
      url: dto.url,
      title: dto.title ?? null,
      sortOrder: dto.sortOrder ?? 0,
      project,
    });
    const saved = await this.videoRepo.save(video);
    void this.revalidate(['projects', `project-${project.slug}`]);
    return this.toVideoDto(saved);
  }

  async reorderVideos(projectId: string, dto: ReorderVideosDto): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found.`);

    await Promise.all(
      dto.ids.map((videoId, index) =>
        this.videoRepo.update({ id: videoId, project: { id: projectId } }, { sortOrder: index }),
      ),
    );
    void this.revalidate(['projects', `project-${project.slug}`]);
  }

  async removeVideo(projectId: string, videoId: string): Promise<void> {
    const result = await this.videoRepo.delete({ id: videoId, project: { id: projectId } });
    if (result.affected === 0) throw new NotFoundException(`Video ${videoId} not found.`);
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (project) void this.revalidate(['projects', `project-${project.slug}`]);
  }
}
