/**
 * Portfolio CMS — clear-then-seed script.
 *
 * Usage:
 *   npm run seed           (from apps/api)
 *   yarn workspace api seed
 *
 * Truncates all content tables (preserving admin_users), then inserts
 * canonical seed data from seed-data.ts.
 *
 * Data source: src/seeds/seed-data.ts
 */

import 'reflect-metadata';
import AppDataSource from '../database/data-source';
import { ResumeProfile }   from '../entities/resume-profile.entity';
import { Skill }           from '../entities/skill.entity';
import { ExperienceEntry } from '../entities/experience-entry.entity';
import { EducationEntry }  from '../entities/education-entry.entity';
import { Patent }          from '../entities/patent.entity';
import { Certification }   from '../entities/certification.entity';
import { Award }           from '../entities/award.entity';
import { Project }         from '../entities/project.entity';
import { Album }           from '../entities/album.entity';
import { Photo }           from '../entities/photo.entity';
import {
  PROFILE_SEED,
  SKILLS_SEED,
  EXPERIENCE_SEED,
  EDUCATION_SEED,
  PATENTS_SEED,
  CERTIFICATIONS_SEED,
  AWARDS_SEED,
  PROJECTS_SEED,
  DEFAULT_ALBUM,
  PHOTOS_SEED,
} from './seed-data';


// ─── Clear ────────────────────────────────────────────────────────────────────

async function clearDatabase(ds: typeof AppDataSource): Promise<void> {
  console.log('🗑️  Clearing existing data…');
  // TRUNCATE with CASCADE handles:
  //   • circular FK between albums.coverId and photos.album_id
  //   • M2M join tables: experience_skills, project_skills, post_tags
  // admin_users is intentionally excluded — admin accounts must survive reseeds.
  await ds.query(`
    TRUNCATE TABLE
      photos, albums,
      project_media, project_videos, projects,
      post_tags, blog_posts, tags,
      experience_skills, experience_entries,
      awards, certifications, patents, education_entries,
      skills, resume_profile
    RESTART IDENTITY CASCADE
  `);
  console.log('  ✓ Done\n');
}


// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🌱 Connecting to database…');
  await AppDataSource.initialize();

  try {
    await clearDatabase(AppDataSource);

    // ── 1. Resume profile ─────────────────────────────────────────────────
    const profileRepo = AppDataSource.getRepository(ResumeProfile);
    await profileRepo.save(profileRepo.create(PROFILE_SEED));
    console.log('  ✓ ResumeProfile');

    // ── 2. Skills ─────────────────────────────────────────────────────────
    const skillRepo = AppDataSource.getRepository(Skill);
    const skillMap = new Map<string, Skill>();

    for (const s of SKILLS_SEED) {
      const skill = await skillRepo.save(skillRepo.create(s));
      skillMap.set(s.name, skill);
    }
    console.log(`  ✓ Skills (${SKILLS_SEED.length})`);

    // ── 3. Experience entries ─────────────────────────────────────────────
    const expRepo = AppDataSource.getRepository(ExperienceEntry);
    for (const e of EXPERIENCE_SEED) {
      const skills = e.techStack
        .map((name) => skillMap.get(name))
        .filter((s): s is Skill => s !== undefined);

      await expRepo.save(expRepo.create({
        title:     e.title,
        company:   e.company,
        location:  e.location,
        startDate: e.startDate,
        endDate:   e.endDate,
        isCurrent: e.isCurrent,
        tasks:     e.tasks,
        sortOrder: e.sortOrder,
        skills,
      }));
      console.log(`  ✓ Experience: ${e.title} @ ${e.company}`);
    }

    // ── 4. Education entries ──────────────────────────────────────────────
    const eduRepo = AppDataSource.getRepository(EducationEntry);
    for (const ed of EDUCATION_SEED) {
      await eduRepo.save(eduRepo.create(ed));
      console.log(`  ✓ Education: ${ed.degree}`);
    }

    // ── 5. Patents ────────────────────────────────────────────────────────
    const patentRepo = AppDataSource.getRepository(Patent);
    for (const p of PATENTS_SEED) {
      await patentRepo.save(patentRepo.create(p));
      console.log(`  ✓ Patent: ${p.link}`);
    }

    // ── 6. Certifications ─────────────────────────────────────────────────
    const certRepo = AppDataSource.getRepository(Certification);
    for (const c of CERTIFICATIONS_SEED) {
      await certRepo.save(certRepo.create(c));
      console.log(`  ✓ Certification: ${c.title}`);
    }

    // ── 7. Awards ─────────────────────────────────────────────────────────
    const awardRepo = AppDataSource.getRepository(Award);
    for (const a of AWARDS_SEED) {
      await awardRepo.save(awardRepo.create(a));
      console.log(`  ✓ Award: ${a.title}`);
    }

    // ── 8. Projects ───────────────────────────────────────────────────────
    const projectRepo = AppDataSource.getRepository(Project);
    for (const p of PROJECTS_SEED) {
      const skills = p.techStack
        .map((name) => skillMap.get(name))
        .filter((s): s is Skill => s !== undefined);

      await projectRepo.save(projectRepo.create({
        slug:        p.slug,
        title:       p.title,
        company:     p.company ?? null,
        role:        p.role ?? null,
        startDate:   p.startDate ?? null,
        endDate:     p.endDate ?? null,
        description: p.description ?? null,
        githubUrl:   p.githubUrl ?? null,
        liveDemoUrl: p.liveDemoUrl ?? null,
        featured:    p.featured,
        published:   p.published,
        sortOrder:   p.sortOrder,
        skills,
      }));
      console.log(`  ✓ Project: ${p.title}`);
    }

    // ── 9. Gallery — default album + photos ───────────────────────────────
    const albumRepo = AppDataSource.getRepository(Album);
    const album = await albumRepo.save(albumRepo.create(DEFAULT_ALBUM));
    console.log(`  ✓ Album: ${DEFAULT_ALBUM.name}`);

    const photoRepo = AppDataSource.getRepository(Photo);
    for (const ph of PHOTOS_SEED) {
      await photoRepo.save(photoRepo.create({
        title:       ph.title ?? null,
        location:    ph.location ?? null,
        originalUrl: ph.originalUrl,
        thumbUrl:    ph.thumbUrl,
        sortOrder:   ph.sortOrder,
        published:   true,
        album,
      }));
      console.log(`  ✓ Photo: ${ph.title ?? ph.sortOrder}`);
    }

    console.log('\n✅ Seed complete — database is ready.');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((err: unknown) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
