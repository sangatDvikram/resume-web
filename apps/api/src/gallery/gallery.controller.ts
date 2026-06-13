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
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateAlbumDto,
  UpdateAlbumDto,
  UpdatePhotoDto,
  ReorderPhotosDto,
} from './dto/gallery.dto';

const memStorage = memoryStorage();

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // ── Public: albums ─────────────────────────────────────────────────────────

  /** GET /v1/gallery/albums — all published albums with cover + count */
  @Get('albums')
  listAlbums() {
    return this.galleryService.findAllAlbums(true);
  }

  /** GET /v1/gallery/albums/:slug — album detail + first page of photos */
  @Get('albums/:slug')
  getAlbum(@Param('slug') slug: string, @Query('cursor') cursor?: string) {
    return this.galleryService.findAlbumBySlug(slug, cursor, true);
  }

  // ── Public: photos ─────────────────────────────────────────────────────────

  /** GET /v1/gallery/photos — paginated photo feed (all or per album) */
  @Get('photos')
  listPhotos(
    @Query('albumId') albumId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.galleryService.listPhotos(albumId, undefined, cursor, true);
  }

  // ── Admin: albums ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('admin/albums')
  listAlbumsAdmin() {
    return this.galleryService.findAllAlbumsAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('albums')
  @HttpCode(HttpStatus.CREATED)
  createAlbum(@Body() dto: CreateAlbumDto) {
    return this.galleryService.createAlbum(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('albums/:id')
  updateAlbum(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.galleryService.updateAlbum(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('albums/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlbum(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.deleteAlbum(id);
  }

  // ── Admin: photos ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('admin/photos')
  listPhotosAdmin(
    @Query('albumId') albumId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.galleryService.listPhotosAdmin(albumId, cursor);
  }

  /** POST /v1/gallery/photos/upload — single photo upload */
  @UseGuards(JwtAuthGuard)
  @Post('photos/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memStorage }))
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Query('albumId') albumId?: string,
  ) {
    return this.galleryService.uploadPhoto(file, albumId);
  }

  /** POST /v1/gallery/photos/bulk-upload — up to 50 photos in one batch */
  @UseGuards(JwtAuthGuard)
  @Post('photos/bulk-upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 50, { storage: memStorage }))
  async bulkUploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('albumId') albumId?: string,
  ) {
    const results = await Promise.allSettled(
      files.map((f) => this.galleryService.uploadPhoto(f, albumId)),
    );
    return {
      succeeded: results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled',
        )
        .map((r) => r.value),
      failed: results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => ({ reason: r.reason?.message ?? String(r.reason) })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('photos/:id')
  updatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhotoDto,
  ) {
    return this.galleryService.updatePhoto(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.deletePhoto(id);
  }

  /** PATCH /v1/gallery/photos/reorder — batch-reorder by ordered ID array */
  @UseGuards(JwtAuthGuard)
  @Patch('photos/reorder')
  reorderPhotos(
    @Body() dto: ReorderPhotosDto,
    @Query('albumId') albumId?: string,
  ) {
    return this.galleryService.reorderPhotos(albumId, dto);
  }
}
