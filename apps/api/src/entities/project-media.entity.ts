import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Project } from './project.entity';

@Entity('project_media')
export class ProjectMedia extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Cloudinary CDN URL */
  @Column({ length: 1000 })
  url!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'alt_text' })
  altText!: string | null;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /** CASCADE delete when parent project is removed */
  @ManyToOne('Project', (p: Project) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
