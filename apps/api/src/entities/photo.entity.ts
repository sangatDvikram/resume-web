import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Album } from './album.entity';

@Entity('photos')
@Index(['sortOrder'])
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'alt_text' })
  altText!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  /** Cloudinary public_id — used to construct transformation URLs */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'public_id' })
  publicId!: string | null;

  /** Full-resolution Cloudinary URL */
  @Column({ length: 1000, name: 'original_url' })
  originalUrl!: string;

  /** Thumbnail URL (≈ 400 px wide) */
  @Column({ length: 1000, name: 'thumb_url' })
  thumbUrl!: string;

  /** Low-quality image placeholder: Cloudinary e_blur:2000,q_1,f_auto URL */
  @Column({ type: 'varchar', length: 1000, nullable: true, name: 'lqip_url' })
  lqipUrl!: string | null;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  /**
   * EXIF metadata stored as JSONB.
   * Shape: { make, model, focalLength, aperture, iso, shutterSpeed }
   */
  @Column({ type: 'jsonb', nullable: true })
  exif!: Record<string, unknown> | null;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  @Column({ default: true })
  published!: boolean;

  /** SET NULL on album delete — orphaned photos become "uncategorised" */
  @ManyToOne('Album', (a: Album) => a.photos, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'album_id' })
  album!: Album | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
