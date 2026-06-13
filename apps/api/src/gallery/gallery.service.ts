import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';
import { UploadService } from '../upload/upload.service';
import { generateSlug } from '../common/slug.util';
import {
  CreateAlbumDto,
  UpdateAlbumDto,
  UpdatePhotoDto,
  ReorderPhotosDto,
  AlbumSummaryDto,
  AlbumDetailDto,
  PhotoDto,
  PhotoPageDto,
} from './dto/gallery.dto';

const PAGE_SIZE = 24;

// ── Mappers ────────────────────────────────────────────────────────────────────

function toPhotoDto(p: Photo): PhotoDto {
  return {
    id: p.id,
    title: p.title,
    altText: p.altText,
    location: p.location,
    publicId: p.publicId,
    originalUrl: p.originalUrl,
    thumbUrl: p.thumbUrl,
    lqipUrl: p.lqipUrl,
    width: p.width,
    height: p.height,
    exif: (p.exif as any) ?? null,
    sortOrder: p.sortOrder,
    published: p.published,
    albumId: (p.album as any)?.id ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toAlbumSummary(
  album: Album,
  coverUrl: string | null,
  lqipUrl: string | null,
  photoCount: number,
): AlbumSummaryDto {
  return {
    id: album.id,
    slug: album.slug,
    name: album.name,
    description: album.description,
    location: album.location,
    coverUrl,
    lqipUrl,
    photoCount,
    published: album.published,
    sortOrder: album.sortOrder,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(Album)
    private readonly albumRepo: Repository<Album>,

    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,

    private readonly uploadService: UploadService,
    private readonly config: ConfigService,
  ) {}

  // ── ISR ───────────────────────────────────────────────────────────────────

  private async revalidate(tags: string[] = ['gallery']): Promise<void> {
    const revalidateUrl = this.config.get<string>('NEXT_REVALIDATE_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    if (!revalidateUrl || !secret) return;
    try {
      const res = await fetch(revalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, secret }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) this.logger.warn(`ISR revalidation returned ${res.status}`);
      else this.logger.log(`ISR revalidated: ${tags.join(', ')}`);
    } catch (err) {
      this.logger.error('ISR revalidation fetch failed', err);
    }
  }

  // ── Cover resolution helper ───────────────────────────────────────────────

  private async resolveCoverUrls(
    albums: Album[],
  ): Promise<Map<string, { coverUrl: string | null; lqipUrl: string | null }>> {
    const coverIds = albums.map((a) => a.coverId).filter(Boolean) as string[];
    const covers = coverIds.length
      ? await this.photoRepo.findByIds(coverIds)
      : [];
    const coverMap = new Map(covers.map((p) => [p.id, p]));

    const result = new Map<
      string,
      { coverUrl: string | null; lqipUrl: string | null }
    >();
    for (const album of albums) {
      if (album.coverId && coverMap.has(album.coverId)) {
        const p = coverMap.get(album.coverId)!;
        result.set(album.id, { coverUrl: p.thumbUrl, lqipUrl: p.lqipUrl });
      } else {
        result.set(album.id, { coverUrl: null, lqipUrl: null });
      }
    }
    return result;
  }

  // ── Albums: public ────────────────────────────────────────────────────────

  async findAllAlbums(publishedOnly = true): Promise<AlbumSummaryDto[]> {
    const albums = await this.albumRepo.find({
      where: publishedOnly ? { published: true } : undefined,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // Fetch photo counts per album in a single query
    const counts = await this.photoRepo
      .createQueryBuilder('p')
      .select('p.album_id', 'albumId')
      .addSelect('COUNT(*)', 'cnt')
      .where(publishedOnly ? 'p.published = true' : '1=1')
      .groupBy('p.album_id')
      .getRawMany<{ albumId: string; cnt: string }>();
    const countMap = new Map(counts.map((r) => [r.albumId, Number(r.cnt)]));

    const coverUrls = await this.resolveCoverUrls(albums);

    return albums.map((a) => {
      const { coverUrl, lqipUrl } = coverUrls.get(a.id) ?? {
        coverUrl: null,
        lqipUrl: null,
      };
      return toAlbumSummary(a, coverUrl, lqipUrl, countMap.get(a.id) ?? 0);
    });
  }

  async findAlbumBySlug(
    slug: string,
    cursor?: string,
    publishedOnly = true,
  ): Promise<AlbumDetailDto> {
    const album = await this.albumRepo.findOne({
      where: publishedOnly ? { slug, published: true } : { slug },
    });
    if (!album) throw new NotFoundException(`Album "${slug}" not found.`);

    const { photos, nextCursor, total } = await this.listPhotos(
      undefined,
      album.id,
      cursor,
      publishedOnly,
    );

    const coverUrls = await this.resolveCoverUrls([album]);
    const { coverUrl, lqipUrl } = coverUrls.get(album.id) ?? {
      coverUrl: null,
      lqipUrl: null,
    };

    return {
      ...toAlbumSummary(album, coverUrl, lqipUrl, total),
      photos,
      nextCursor,
      total,
    };
  }

  // ── Photos: public ────────────────────────────────────────────────────────

  /** Cursor-based paginated photo listing.
   *  cursor = base64(offset). If omitted → first page.
   */
  async listPhotos(
    albumId?: string,
    albumIdFilter?: string,
    cursor?: string,
    publishedOnly = true,
  ): Promise<PhotoPageDto> {
    const offset = cursor
      ? Number(Buffer.from(cursor, 'base64').toString('utf8'))
      : 0;
    const effectiveAlbum = albumId ?? albumIdFilter;

    const qb = this.photoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.album', 'album')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.createdAt', 'ASC');

    if (publishedOnly) qb.andWhere('p.published = true');
    if (effectiveAlbum)
      qb.andWhere('album.id = :albumId', { albumId: effectiveAlbum });

    const [photos, total] = await qb
      .skip(offset)
      .take(PAGE_SIZE + 1)
      .getManyAndCount();

    const hasMore = photos.length > PAGE_SIZE;
    const slice = hasMore ? photos.slice(0, PAGE_SIZE) : photos;
    const nextOffset = offset + PAGE_SIZE;
    const nextCursor = hasMore
      ? Buffer.from(String(nextOffset)).toString('base64')
      : null;

    return { photos: slice.map(toPhotoDto), nextCursor, total };
  }

  // ── Albums: admin ─────────────────────────────────────────────────────────

  async createAlbum(dto: CreateAlbumDto): Promise<AlbumSummaryDto> {
    const slug = generateSlug(dto.name);
    const existing = await this.albumRepo.findOne({ where: { slug } });
    if (existing)
      throw new BadRequestException(`Slug "${slug}" already exists.`);

    const album = this.albumRepo.create({
      ...dto,
      slug,
      published: dto.published ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    const saved = await this.albumRepo.save(album);
    void this.revalidate(['gallery']);
    return toAlbumSummary(saved, null, null, 0);
  }

  async updateAlbum(id: string, dto: UpdateAlbumDto): Promise<AlbumSummaryDto> {
    const album = await this.albumRepo.findOne({ where: { id } });
    if (!album) throw new NotFoundException(`Album ${id} not found.`);

    if (dto.name && dto.name !== album.name) {
      const newSlug = generateSlug(dto.name);
      const clash = await this.albumRepo.findOne({ where: { slug: newSlug } });
      if (clash && clash.id !== id)
        throw new BadRequestException(`Slug "${newSlug}" already in use.`);
      album.slug = newSlug;
    }

    Object.assign(album, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.published !== undefined && { published: dto.published }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.coverId !== undefined && { coverId: dto.coverId }),
    });

    const saved = await this.albumRepo.save(album);
    void this.revalidate(['gallery']);
    const coverUrls = await this.resolveCoverUrls([saved]);
    const { coverUrl, lqipUrl } = coverUrls.get(saved.id) ?? {
      coverUrl: null,
      lqipUrl: null,
    };
    const cnt = await this.photoRepo.count({ where: { album: { id } } });
    return toAlbumSummary(saved, coverUrl, lqipUrl, cnt);
  }

  async deleteAlbum(id: string): Promise<void> {
    const result = await this.albumRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Album ${id} not found.`);
    void this.revalidate(['gallery']);
  }

  // ── Photos: admin ─────────────────────────────────────────────────────────

  async uploadPhoto(
    file: Express.Multer.File,
    albumId?: string,
  ): Promise<PhotoDto> {
    const uploadResult = await this.uploadService.uploadPhoto(file);

    let album: Album | null = null;
    if (albumId) {
      album = await this.albumRepo.findOne({ where: { id: albumId } });
      if (!album) throw new NotFoundException(`Album ${albumId} not found.`);
    }

    // Derive next sort order for this album (or global if no album)
    const maxOrder = await this.photoRepo
      .createQueryBuilder('p')
      .select('MAX(p.sort_order)', 'max')
      .where(albumId ? 'p.album_id = :albumId' : '1=1', { albumId })
      .getRawOne<{ max: string | null }>();
    const sortOrder = Number(maxOrder?.max ?? -1) + 1;

    const photo = this.photoRepo.create({
      originalUrl: uploadResult.originalUrl,
      thumbUrl: uploadResult.thumbUrl,
      lqipUrl: uploadResult.lqipUrl,
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      exif: uploadResult.exif as any,
      sortOrder,
      published: true,
      album,
    });
    const saved = await this.photoRepo.save(photo);
    void this.revalidate(['gallery']);
    return toPhotoDto(saved);
  }

  async updatePhoto(id: string, dto: UpdatePhotoDto): Promise<PhotoDto> {
    const photo = await this.photoRepo.findOne({
      where: { id },
      relations: ['album'],
    });
    if (!photo) throw new NotFoundException(`Photo ${id} not found.`);

    if (dto.albumId !== undefined) {
      if (dto.albumId === null) {
        photo.album = null;
      } else {
        const album = await this.albumRepo.findOne({
          where: { id: dto.albumId },
        });
        if (!album)
          throw new NotFoundException(`Album ${dto.albumId} not found.`);
        photo.album = album;
      }
    }

    Object.assign(photo, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.altText !== undefined && { altText: dto.altText }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.published !== undefined && { published: dto.published }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
    });

    const saved = await this.photoRepo.save(photo);
    void this.revalidate(['gallery']);
    return toPhotoDto(saved);
  }

  async deletePhoto(id: string): Promise<void> {
    const result = await this.photoRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Photo ${id} not found.`);
    void this.revalidate(['gallery']);
  }

  async reorderPhotos(
    albumId: string | undefined,
    dto: ReorderPhotosDto,
  ): Promise<void> {
    // Validate all IDs belong to this album (or are uncategorised)
    const updates = dto.ids.map((photoId, idx) =>
      this.photoRepo.update({ id: photoId }, { sortOrder: idx }),
    );
    await Promise.all(updates);
    void this.revalidate(['gallery']);
  }

  // ── Admin helpers ─────────────────────────────────────────────────────────

  async findAllAlbumsAdmin(): Promise<AlbumSummaryDto[]> {
    return this.findAllAlbums(false);
  }

  async listPhotosAdmin(
    albumId?: string,
    cursor?: string,
  ): Promise<PhotoPageDto> {
    return this.listPhotos(albumId, undefined, cursor, false);
  }
}
