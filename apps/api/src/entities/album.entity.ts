import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Photo } from './photo.entity';

@Entity('albums')
export class Album extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 300 })
  slug!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  /**
   * Soft FK to photos.id — stored as a plain UUID column rather than a
   * TypeORM relation to avoid circular cascade issues. The application layer
   * resolves this reference.
   */
  @Column({ type: 'varchar', length: 36, nullable: true, name: 'cover_id' })
  coverId!: string | null;

  @Column({ default: false })
  published!: boolean;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  @OneToMany('Photo', (p: Photo) => p.album)
  photos!: Photo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
