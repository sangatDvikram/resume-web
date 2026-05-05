import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeProfile }   from '../entities/resume-profile.entity';
import { Skill }           from '../entities/skill.entity';
import { ExperienceEntry } from '../entities/experience-entry.entity';
import { EducationEntry }  from '../entities/education-entry.entity';
import { Certification }   from '../entities/certification.entity';
import { Award }           from '../entities/award.entity';
import { Patent }          from '../entities/patent.entity';
import { ResumeService }    from './resume.service';
import { ResumeController } from './resume.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ResumeProfile,
      Skill,
      ExperienceEntry,
      EducationEntry,
      Certification,
      Award,
      Patent,
    ]),
  ],
  providers: [ResumeService],
  controllers: [ResumeController],
  exports: [ResumeService],
})
export class ResumeModule {}
