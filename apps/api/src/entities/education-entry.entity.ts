import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('education_entries')
export class EducationEntry extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** e.g. "BSc Computer Science" */
  @Column({ length: 255 })
  degree!: string;

  /** University / institution name */
  @Column({ length: 255 })
  university!: string;

  /**
   * Human-readable date range string — e.g. "2008 – 2012".
   * Stored as-is for display; not split into start/end dates.
   */
  @Column({ length: 100 })
  duration!: string;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
