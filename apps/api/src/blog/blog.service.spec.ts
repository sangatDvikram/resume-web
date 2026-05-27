import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BlogService } from './blog.service';
import { BlogPost } from '../entities/blog-post.entity';
import { Tag } from '../entities/tag.entity';

// Mock ESM dynamic import used by renderMarkdown
jest.mock('../common/markdown.util', () => ({
  renderMarkdown: jest.fn().mockResolvedValue('<p>hello</p>'),
  estimateReadingTime: jest.fn().mockReturnValue(1),
  generateSlug: jest.fn().mockReturnValue('test-slug'),
}));
jest.mock('../common/slug.util', () => ({
  generateSlug: jest.fn().mockReturnValue('test-slug'),
}));

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const makePost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: 'post-1',
  title: 'Hello World',
  slug: 'hello-world',
  content: '# Hi',
  htmlContent: '<h1>Hi</h1>',
  excerpt: 'Hi',
  published: true,
  publishedAt: new Date().toISOString() as any,
  readingTime: 1,
  tags: [],
  coverImageUrl: null,
  coverImagePublicId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
} as BlogPost);

describe('BlogService', () => {
  let service: BlogService;
  let postRepo: ReturnType<typeof mockRepo>;
  let tagRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    postRepo = mockRepo();
    tagRepo  = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(BlogPost), useValue: postRepo },
        { provide: getRepositoryToken(Tag),      useValue: tagRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = module.get(BlogService);
  });

  describe('findAll', () => {
    it('returns all posts (admin)', async () => {
      postRepo.find.mockResolvedValue([makePost()]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('hello-world');
    });

    it('returns empty array when no posts exist', async () => {
      postRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findAllPublished', () => {
    it('returns only published posts', async () => {
      postRepo.find.mockResolvedValue([makePost({ published: true })]);
      const result = await service.findAllPublished();
      expect(result).toHaveLength(1);
    });
  });

  describe('findBySlug', () => {
    it('returns a post detail DTO for a valid slug', async () => {
      postRepo.findOne.mockResolvedValue(makePost());
      const result = await service.findBySlug('hello-world');
      expect(result.slug).toBe('hello-world');
      expect(result.htmlContent).toBe('<h1>Hi</h1>');
    });

    it('throws NotFoundException for an unknown slug', async () => {
      postRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when deleting a non-existent post', async () => {
      postRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('resolves without error when post exists', async () => {
      postRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('post-1')).resolves.toBeUndefined();
    });
  });
});
