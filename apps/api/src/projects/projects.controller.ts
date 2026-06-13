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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMediaDto,
  ReorderMediaDto,
  AddVideoDto,
  ReorderVideosDto,
} from './dto/project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ── Public endpoints ───────────────────────────────────────────────────────

  /**
   * GET /v1/projects
   * Returns all published projects (summary — no htmlDescription / videos).
   */
  @Get()
  findAll() {
    return this.projectsService.findAllPublished();
  }

  /**
   * GET /v1/projects/:slug
   * Returns a single published project with full detail (media, videos, skills).
   */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  /**
   * POST /v1/projects
   * Creates a new project; auto-generates slug from title.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  /**
   * PATCH /v1/projects/:id
   * Partially updates a project; re-renders HTML only when description changes.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  /**
   * DELETE /v1/projects/:id
   * Permanently removes a project (cascades to media & videos).
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  // ── Media sub-resource ─────────────────────────────────────────────────────

  /** POST /v1/projects/:id/media — add a media item (CDN URL) to a project */
  @UseGuards(JwtAuthGuard)
  @Post(':id/media')
  @HttpCode(HttpStatus.CREATED)
  addMedia(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddMediaDto) {
    return this.projectsService.addMedia(id, dto);
  }

  /** PATCH /v1/projects/:id/media/reorder — update sortOrder for all media */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/media/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderMediaDto,
  ) {
    return this.projectsService.reorderMedia(id, dto);
  }

  /** DELETE /v1/projects/:id/media/:mediaId — remove a single media item */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/media/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.projectsService.removeMedia(id, mediaId);
  }

  // ── Video sub-resource ─────────────────────────────────────────────────────

  /** POST /v1/projects/:id/videos — add a video to a project */
  @UseGuards(JwtAuthGuard)
  @Post(':id/videos')
  @HttpCode(HttpStatus.CREATED)
  addVideo(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddVideoDto) {
    return this.projectsService.addVideo(id, dto);
  }

  /** PATCH /v1/projects/:id/videos/reorder — update sortOrder for all videos */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/videos/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderVideos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderVideosDto,
  ) {
    return this.projectsService.reorderVideos(id, dto);
  }

  /** DELETE /v1/projects/:id/videos/:videoId — remove a single video */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/videos/:videoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVideo(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('videoId', ParseUUIDPipe) videoId: string,
  ) {
    return this.projectsService.removeVideo(id, videoId);
  }
}
