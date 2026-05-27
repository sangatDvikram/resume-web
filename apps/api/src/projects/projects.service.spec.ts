import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from './projects.service';
import { Project } from '../entities/project.entity';
import { ProjectMedia } from '../entities/project-media.entity';
import { ProjectVideo } from '../entities/project-video.entity';
import { Skill } from '../entities/skill.entity';

jest.mock('../common/markdown.util', () => ({
  renderMarkdown: jest.fn().mockResolvedValue('<p>desc</p>'),
}));
jest.mock('../common/slug.util', () => ({
  generateSlug: jest.fn().mockReturnValue('my-project'),
}));

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  slug: 'my-project',
  title: 'My Project',
  company: 'ACME',
  role: 'Dev',
  description: 'Description',
  htmlDescription: '<p>desc</p>',
  startDate: new Date('2024-01-01'),
  endDate: null,
  githubUrl: null,
  liveDemoUrl: null,
  featured: false,
  published: true,
  sortOrder: 0,
  skills: [],
  media: [],
  videos: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
} as Project);

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepo: ReturnType<typeof mockRepo>;
  let mediaRepo: ReturnType<typeof mockRepo>;
  let videoRepo: ReturnType<typeof mockRepo>;
  let skillRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    projectRepo = mockRepo();
    mediaRepo   = mockRepo();
    videoRepo   = mockRepo();
    skillRepo   = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project),      useValue: projectRepo },
        { provide: getRepositoryToken(ProjectMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(ProjectVideo), useValue: videoRepo },
        { provide: getRepositoryToken(Skill),        useValue: skillRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('findAllPublished', () => {
    it('returns summary DTOs for published projects', async () => {
      projectRepo.find.mockResolvedValue([makeProject()]);
      const result = await service.findAllPublished();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('my-project');
    });

    it('returns empty array when no projects', async () => {
      projectRepo.find.mockResolvedValue([]);
      expect(await service.findAllPublished()).toEqual([]);
    });
  });

  describe('findBySlug', () => {
    it('returns a project detail DTO', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());
      const result = await service.findBySlug('my-project');
      expect(result.slug).toBe('my-project');
      expect(result.htmlDescription).toBe('<p>desc</p>');
    });

    it('throws NotFoundException for unknown slug', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when project does not exist', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('resolves when project is found and deleted', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());
      projectRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('proj-1')).resolves.toBeUndefined();
    });
  });
});
