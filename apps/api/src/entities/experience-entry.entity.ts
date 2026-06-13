import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Skill } from './skill.entity';
import { ResumeProfile } from './resume-profile.entity';

@Entity('experience_entries')
export class ExperienceEntry extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Job title — exp.title */
  @Column({ length: 255 })
  title!: string;

  /** Employer — exp.company */
  @Column({ length: 255 })
  company!: string;

  /** City / region — exp.area */
  @Column({ length: 255 })
  location!: string;

  /** exp.duration[0] converted to Date */
  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate!: Date;

  /**
   * exp.duration[1] converted to Date.
   * NULL when isCurrent is true.
   */
  @Column({ type: 'timestamptz', name: 'end_date', nullable: true })
  endDate!: Date | null;

  /** True for the currently-held role — exp.isCurrent */
  @Column({ default: false, name: 'is_current' })
  isCurrent!: boolean;

  /**
   * Bullet-point achievements — exp.tasks[].
   * Stored as a native PostgreSQL text array.
   */
  @Column({ type: 'text', array: true })
  tasks!: string[];

  /** Display order (lower = first) */
  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /**
   * Tech stack — exp.techStack[].
   * Many-to-many via the experience_skills join table.
   * This side owns the JoinTable.
   */
  @ManyToMany(() => Skill, (s) => s.experiences, { eager: false })
  @JoinTable({
    name: 'experience_skills',
    joinColumn: { name: 'experience_entry_id' },
    inverseJoinColumn: { name: 'skill_id' },
  })
  skills!: Skill[];

  /** Resume variant this entry belongs to */
  @ManyToOne(() => ResumeProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  @Index()
  profile!: ResumeProfile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
