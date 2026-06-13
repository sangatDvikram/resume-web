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
import { ResumeProfile } from './resume-profile.entity';

@Entity('awards')
export class Award extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ length: 255 })
  issuer!: string;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /** Resume variant this award belongs to */
  @ManyToOne(() => ResumeProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  @Index()
  profile!: ResumeProfile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
