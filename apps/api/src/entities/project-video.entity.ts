import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VideoSource } from './enums';
import type { Project } from './project.entity';

@Entity('project_videos')
export class ProjectVideo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: VideoSource })
  source!: VideoSource;

  /** YouTube / Vimeo share URL or self-hosted MP4 URL */
  @Column({ length: 1000 })
  url!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title!: string | null;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /** CASCADE delete when parent project is removed */
  @ManyToOne('Project', (p: Project) => p.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
