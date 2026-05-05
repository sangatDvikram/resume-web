import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('patents')
export class Patent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Patent number / identifier — e.g. "GB2572361A" */
  @Column({ length: 100 })
  link!: string;

  /** Full Google Patents URL */
  @Column({ length: 1000 })
  url!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
