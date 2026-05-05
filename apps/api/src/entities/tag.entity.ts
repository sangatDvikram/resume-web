import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import type { BlogPost } from './blog-post.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  /** Inverse side — JoinTable is declared on BlogPost. */
  @ManyToMany('BlogPost', (b: BlogPost) => b.tags)
  posts!: BlogPost[];
}
