import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Skill } from './skill.entity';
import { ProjectMedia } from './project-media.entity';
import { ProjectVideo } from './project-video.entity';

@Entity('projects')
@Index(['published', 'sortOrder'])
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 300 })
  slug!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role!: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'start_date' })
  startDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'end_date' })
  endDate!: Date | null;

  /** Markdown source */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Cached rendered HTML */
  @Column({ type: 'text', nullable: true, name: 'html_description' })
  htmlDescription!: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true, name: 'github_url' })
  githubUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    name: 'live_demo_url',
  })
  liveDemoUrl!: string | null;

  /** Flag for the featured project strip on the homepage */
  @Column({ default: false })
  featured!: boolean;

  @Column({ default: false })
  published!: boolean;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /** Tech stack — many-to-many via project_skills join table */
  @ManyToMany(() => Skill, (s) => s.projects, { cascade: true, eager: false })
  @JoinTable({
    name: 'project_skills',
    joinColumn: { name: 'project_id' },
    inverseJoinColumn: { name: 'skill_id' },
  })
  skills!: Skill[];

  @OneToMany(() => ProjectMedia, (m) => m.project, { cascade: true })
  media!: ProjectMedia[];

  @OneToMany(() => ProjectVideo, (v) => v.project, { cascade: true })
  videos!: ProjectVideo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
