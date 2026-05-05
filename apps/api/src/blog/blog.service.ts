import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { Tag } from '../entities/tag.entity';
import { generateSlug } from '../common/slug.util';
import { renderMarkdown, estimateReadingTime } from '../common/markdown.util';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostSummaryDto,
  BlogPostDetailDto,
} from './dto/blog-post.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,

    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    private readonly config: ConfigService,
  ) {}

  // ── ISR revalidation ──────────────────────────────────────────────────────

  private async revalidate(tags: string[] = ['blog']): Promise<void> {
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

  // ── Tag upsert ────────────────────────────────────────────────────────────

  /**
   * For each name, find an existing Tag (case-insensitive) or create one.
   * Returns the resolved Tag entities.
   */
  private async upsertTags(names: string[] = []): Promise<Tag[]> {
    if (!names.length) return [];
    return Promise.all(
      names.map(async (name) => {
        const normalised = name.trim().toLowerCase();
        let tag = await this.tagRepo.findOne({ where: { name: normalised } });
        if (!tag) {
          tag = this.tagRepo.create({ name: normalised });
          tag = await this.tagRepo.save(tag);
        }
        return tag;
      }),
    );
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAllPublished(): Promise<BlogPostSummaryDto[]> {
    const posts = await this.postRepo.find({
      where: { published: true },
      relations: ['tags'],
      order: { publishedAt: 'DESC' },
      select: ['id', 'slug', 'title', 'excerpt', 'coverImageUrl',
               'readingTime', 'published', 'publishedAt', 'createdAt', 'updatedAt'],
    });
    return posts as BlogPostSummaryDto[];
  }

  async findAll(): Promise<BlogPostSummaryDto[]> {
    const posts = await this.postRepo.find({
      relations: ['tags'],
      order: { createdAt: 'DESC' },
      select: ['id', 'slug', 'title', 'excerpt', 'coverImageUrl',
               'readingTime', 'published', 'publishedAt', 'createdAt', 'updatedAt'],
    });
    return posts as BlogPostSummaryDto[];
  }

  async findBySlug(slug: string): Promise<BlogPostDetailDto> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['tags'],
    });
    if (!post) throw new NotFoundException(`Blog post "${slug}" not found.`);
    return post as BlogPostDetailDto;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  async create(dto: CreateBlogPostDto): Promise<BlogPostDetailDto> {
    const slug        = generateSlug(dto.title);
    const htmlContent = await renderMarkdown(dto.rawMarkdown);
    const readingTime = estimateReadingTime(dto.rawMarkdown);
    const tags        = await this.upsertTags(dto.tagNames);

    const published   = dto.published ?? false;
    const publishedAt = published ? new Date() : null;

    const post = this.postRepo.create({
      slug,
      title: dto.title,
      excerpt: dto.excerpt ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      rawMarkdown: dto.rawMarkdown,
      htmlContent,
      readingTime,
      published,
      publishedAt,
      tags,
    });

    const saved = await this.postRepo.save(post);
    void this.revalidate(['blog']);
    return saved as BlogPostDetailDto;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostDetailDto> {
    const post = await this.postRepo.findOne({ where: { id }, relations: ['tags'] });
    if (!post) throw new NotFoundException(`Blog post ${id} not found.`);

    if (dto.rawMarkdown !== undefined) {
      post.rawMarkdown  = dto.rawMarkdown;
      post.htmlContent  = await renderMarkdown(dto.rawMarkdown);
      post.readingTime  = estimateReadingTime(dto.rawMarkdown);
    }
    if (dto.title        !== undefined) post.title        = dto.title;
    if (dto.excerpt      !== undefined) post.excerpt      = dto.excerpt ?? null;
    if (dto.coverImageUrl !== undefined) post.coverImageUrl = dto.coverImageUrl ?? null;
    if (dto.tagNames     !== undefined) post.tags         = await this.upsertTags(dto.tagNames);

    if (dto.published !== undefined) {
      post.published   = dto.published;
      if (dto.published && !post.publishedAt) post.publishedAt = new Date();
      if (!dto.published) post.publishedAt = null;
    }

    const saved = await this.postRepo.save(post);
    void this.revalidate(['blog']);
    return saved as BlogPostDetailDto;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Blog post ${id} not found.`);
    void this.revalidate(['blog']);
  }
}
