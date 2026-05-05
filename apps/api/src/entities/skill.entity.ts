import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { SkillCategory } from './enums';
import type { ExperienceEntry } from './experience-entry.entity';
import type { Project } from './project.entity';

@Entity('skills')
@Index(['name', 'category'])
export class Skill extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: SkillCategory })
  category!: SkillCategory;

  /**
   * Inverse side of the ExperienceEntry ↔ Skill many-to-many.
   * JoinTable is declared on ExperienceEntry side.
   */
  @ManyToMany('ExperienceEntry', (e: ExperienceEntry) => e.skills)
  experiences!: ExperienceEntry[];

  /**
   * Inverse side of the Project ↔ Skill many-to-many.
   * JoinTable is declared on Project side.
   */
  @ManyToMany('Project', (p: Project) => p.skills)
  projects!: Project[];
}
