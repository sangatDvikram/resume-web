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

@Entity('certifications')
export class Certification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ length: 255 })
  issuer!: string;

  /** Optional URL to the credential — BLOCKCHAIN constant maps here */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  link!: string | null;

  @Column({ default: 0, name: 'sort_order' })
  sortOrder!: number;

  /** Resume variant this certification belongs to */
  @ManyToOne(() => ResumeProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  @Index()
  profile!: ResumeProfile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
