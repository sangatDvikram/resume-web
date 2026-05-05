import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ── Public endpoints ───────────────────────────────────────────────────────

  /**
   * GET /v1/blog
   * Returns all published posts (summary — no htmlContent / rawMarkdown).
   * Cached by Next.js ISR with the "blog" tag.
   */
  @Get()
  findAll() {
    return this.blogService.findAllPublished();
  }

  /**
   * GET /v1/blog/tags
   * Returns all tags sorted alphabetically.
   * Used by the AdminJS tag-picker component and optionally by the public frontend.
   * Must be declared BEFORE :slug to avoid route conflict.
   */
  @Get('tags')
  findAllTags() {
    return this.blogService.findAllTags();
  }

  /**
   * GET /v1/blog/:slug
   * Returns a single published post with full htmlContent.
   */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // ── Admin endpoints (auth required) ───────────────────────────────────────

  /**
   * POST /v1/blog
   * Creates a new blog post; auto-generates slug from title.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  /**
   * PATCH /v1/blog/:id
   * Partially updates a post; re-renders HTML only when rawMarkdown changes.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, dto);
  }

  /**
   * DELETE /v1/blog/:id
   * Permanently removes a post.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.remove(id);
  }
}
