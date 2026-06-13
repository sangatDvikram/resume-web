import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity('blog_posts')
@Index(['published', 'publishedAt'])
export class BlogPost extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 300 })
  slug!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    name: 'cover_image_url',
  })
  coverImageUrl!: string | null;

  /** Raw Markdown source authored by admin */
  @Column({ type: 'text', name: 'raw_markdown' })
  rawMarkdown!: string;

  /** Server-side rendered HTML — cached to avoid re-render on every request */
  @Column({ type: 'text', name: 'html_content' })
  htmlContent!: string;

  /** Reading time in minutes — computed on save */
  @Column({ type: 'int', nullable: true, name: 'reading_time' })
  readingTime!: number | null;

  @Column({ default: false })
  published!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'published_at' })
  publishedAt!: Date | null;

  /** Tags — this side owns the post_tags join table */
  @ManyToMany(() => Tag, (t) => t.posts, { cascade: true, eager: false })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'blog_post_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags!: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
