/**
 * Barrel export for all TypeORM entity classes.
 *
 * Import from here rather than from individual files to avoid
 * deep import paths in modules and seed scripts.
 *
 * NOTE: AdminUser lives in admin-user/admin-user.entity.ts
 *       and is NOT re-exported here to avoid module duplication.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────
export { SkillCategory, VideoSource } from './enums';

// ─── Resume ───────────────────────────────────────────────────────────────────
export { ResumeProfile } from './resume-profile.entity';
export { Skill } from './skill.entity';
export { ExperienceEntry } from './experience-entry.entity';
export { EducationEntry } from './education-entry.entity';
export { Patent } from './patent.entity';
export { Certification } from './certification.entity';
export { Award } from './award.entity';

// ─── Blog ─────────────────────────────────────────────────────────────────────
export { Tag } from './tag.entity';
export { BlogPost } from './blog-post.entity';

// ─── Projects ─────────────────────────────────────────────────────────────────
export { Project } from './project.entity';
export { ProjectMedia } from './project-media.entity';
export { ProjectVideo } from './project-video.entity';

// ─── Gallery ──────────────────────────────────────────────────────────────────
export { Album } from './album.entity';
export { Photo } from './photo.entity';
