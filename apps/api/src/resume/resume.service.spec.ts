import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ResumeService } from './resume.service';
import { ResumeProfile } from '../entities/resume-profile.entity';
import { Skill } from '../entities/skill.entity';
import { ExperienceEntry } from '../entities/experience-entry.entity';
import { EducationEntry } from '../entities/education-entry.entity';
import { Certification } from '../entities/certification.entity';
import { Award } from '../entities/award.entity';
import { Patent } from '../entities/patent.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const makeProfile = (): ResumeProfile =>
  ({
    id: 'profile-1',
    name: 'John Doe',
    position: 'Software Engineer',
    description: 'A developer',
    email: 'john@example.com',
    phone: '555-1234',
    location: 'NYC',
    linkedInUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    websiteUrl: null,
    avatarUrl: 'https://example.com/avatar.jpg',
    careerStartDate: new Date('2016-07-01'),
    freelanceStartDate: new Date('2012-03-01'),
    updatedAt: new Date(),
  }) as ResumeProfile;

describe('ResumeService', () => {
  let service: ResumeService;
  let profileRepo: ReturnType<typeof mockRepo>;
  let skillRepo: ReturnType<typeof mockRepo>;
  let expRepo: ReturnType<typeof mockRepo>;
  let eduRepo: ReturnType<typeof mockRepo>;
  let certRepo: ReturnType<typeof mockRepo>;
  let awardRepo: ReturnType<typeof mockRepo>;
  let patentRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    profileRepo = mockRepo();
    skillRepo = mockRepo();
    expRepo = mockRepo();
    eduRepo = mockRepo();
    certRepo = mockRepo();
    awardRepo = mockRepo();
    patentRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: getRepositoryToken(ResumeProfile), useValue: profileRepo },
        { provide: getRepositoryToken(Skill), useValue: skillRepo },
        { provide: getRepositoryToken(ExperienceEntry), useValue: expRepo },
        { provide: getRepositoryToken(EducationEntry), useValue: eduRepo },
        { provide: getRepositoryToken(Certification), useValue: certRepo },
        { provide: getRepositoryToken(Award), useValue: awardRepo },
        { provide: getRepositoryToken(Patent), useValue: patentRepo },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(ResumeService);
  });

  describe('computeYearsOfExperience', () => {
    it('returns a string ending with "+"', () => {
      const result = service.computeYearsOfExperience(new Date('2016-07-01'));
      expect(result).toMatch(/^\d+\+$/);
    });

    it('returns at least 8+ years for a 2016 start date', () => {
      const result = service.computeYearsOfExperience(new Date('2016-07-01'));
      expect(parseInt(result)).toBeGreaterThanOrEqual(8);
    });
  });

  describe('getResume', () => {
    it('returns a full resume DTO', async () => {
      const profile = makeProfile();
      profileRepo.findOne.mockResolvedValue(profile);
      skillRepo.find.mockResolvedValue([]);
      expRepo.find.mockResolvedValue([]);
      eduRepo.find.mockResolvedValue([]);
      certRepo.find.mockResolvedValue([]);
      awardRepo.find.mockResolvedValue([]);
      patentRepo.find.mockResolvedValue([]);

      const result = await service.getResume('default');
      expect(result.profile.name).toBe('John Doe');
      expect(result.profile.yearsOfExperienceString).toMatch(/^\d+\+$/);
    });

    it('throws NotFoundException when no profile exists', async () => {
      profileRepo.findOne.mockResolvedValue(null);
      skillRepo.find.mockResolvedValue([]);
      expRepo.find.mockResolvedValue([]);
      eduRepo.find.mockResolvedValue([]);
      certRepo.find.mockResolvedValue([]);
      awardRepo.find.mockResolvedValue([]);
      patentRepo.find.mockResolvedValue([]);

      await expect(service.getResume('default')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllSkills', () => {
    it('returns all skills', async () => {
      skillRepo.find.mockResolvedValue([
        { id: 's1', name: 'TypeScript', category: 'Languages' },
      ]);
      const result = await service.findAllSkills();
      expect(result).toHaveLength(1);
    });
  });
});
