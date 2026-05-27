import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { GalleryService } from './gallery.service';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';
import { UploadService } from '../upload/upload.service';

jest.mock('../common/slug.util', () => ({
  generateSlug: jest.fn().mockReturnValue('test-album'),
}));

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const makeAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: 'album-1',
  slug: 'test-album',
  name: 'Test Album',
  description: 'A test album',
  location: null,
  coverId: null,
  published: true,
  sortOrder: 0,
  photos: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
} as Album);

describe('GalleryService', () => {
  let service: GalleryService;
  let albumRepo: ReturnType<typeof mockRepo>;
  let photoRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    albumRepo = mockRepo();
    photoRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryService,
        { provide: getRepositoryToken(Album), useValue: albumRepo },
        { provide: getRepositoryToken(Photo), useValue: photoRepo },
        {
          provide: UploadService,
          useValue: { uploadPhoto: jest.fn(), uploadImage: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = module.get(GalleryService);
  });

  describe('findAllAlbums', () => {
    it('returns album summaries', async () => {
      albumRepo.find.mockResolvedValue([makeAlbum()]);
      photoRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      photoRepo.findByIds.mockResolvedValue([]);

      const result = await service.findAllAlbums(true);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('test-album');
    });

    it('returns empty array when no albums exist', async () => {
      albumRepo.find.mockResolvedValue([]);
      photoRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAllAlbums(true);
      expect(result).toEqual([]);
    });
  });

  describe('createAlbum', () => {
    it('creates and returns a new album summary', async () => {
      albumRepo.findOne.mockResolvedValue(null); // no slug clash
      const album = makeAlbum();
      albumRepo.create.mockReturnValue(album);
      albumRepo.save.mockResolvedValue(album);
      photoRepo.findByIds.mockResolvedValue([]);

      const result = await service.createAlbum({ name: 'Test Album' });
      expect(result.slug).toBe('test-album');
    });

    it('throws BadRequestException when slug already exists', async () => {
      albumRepo.findOne.mockResolvedValue(makeAlbum()); // slug clash
      await expect(service.createAlbum({ name: 'Test Album' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAlbum', () => {
    it('throws NotFoundException when album does not exist', async () => {
      albumRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteAlbum('missing')).rejects.toThrow(NotFoundException);
    });

    it('resolves when album is deleted', async () => {
      albumRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.deleteAlbum('album-1')).resolves.toBeUndefined();
    });
  });
});
