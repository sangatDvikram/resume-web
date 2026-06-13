import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('resume_profile')
export class ResumeProfile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** URL-safe slug identifying this resume variant — e.g. "default", "patent-attorney" */
  @Column({ unique: true, length: 100, default: 'default' })
  slug!: string;

  /** Full name — PROFILE.name / RESUME.name */
  @Column({ length: 255 })
  name!: string;

  /** Job title / position — PROFILE.title / RESUME.position */
  @Column({ length: 255 })
  position!: string;

  /** Short bio / summary paragraph — PROFILE.description / RESUME.description */
  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 255 })
  email!: string;

  /** RESUME.mobile */
  @Column({ length: 50 })
  phone!: string;

  /** RESUME.address */
  @Column({ length: 255 })
  location!: string;

  @Column({ length: 500 })
  linkedInUrl!: string;

  @Column({ length: 500 })
  githubUrl!: string;

  /** Optional personal website / portfolio URL */
  @Column({ type: 'varchar', length: 500, nullable: true })
  websiteUrl!: string | null;

  /** Gravatar URL at 400 px — gravatar(400) */
  @Column({ length: 500 })
  avatarUrl!: string;

  /** CAREER_START_DATE: new Date(2016, 6, 1) → 2016-07-01 */
  @Column({ type: 'timestamptz' })
  careerStartDate!: Date;

  /** Freelance start — new Date(2012, 2, 1) → 2012-03-01 */
  @Column({ type: 'timestamptz' })
  freelanceStartDate!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
