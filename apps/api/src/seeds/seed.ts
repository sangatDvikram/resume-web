/**
 * Portfolio CMS — drop-migrate-seed script.
 *
 * Usage:
 *   yarn workspace api seed
 *
 * Flow:
 *   1. Drop all content tables + typeorm_migrations (raw pg, unpooled).
 *      admin_users is intentionally excluded.
 *   2. AppDataSource.initialize() + runMigrations() recreates schema cleanly.
 *   3. Seed data in FK-dependency order.
 *
 * Seed order:
 *   Skills → ResumeProfile → Experience/Education/Patent/Cert/Award
 *   → Projects → Gallery
 */

import 'reflect-metadata';
import { Client } from 'pg';
import AppDataSource from '../database/data-source';
import { ResumeProfile } from '../entities/resume-profile.entity';
import { Skill } from '../entities/skill.entity';
import { ExperienceEntry } from '../entities/experience-entry.entity';
import { EducationEntry } from '../entities/education-entry.entity';
import { Patent } from '../entities/patent.entity';
import { Certification } from '../entities/certification.entity';
import { Award } from '../entities/award.entity';
import { Project } from '../entities/project.entity';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';
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

// ─── Pre-drop (raw pg, unpooled) ─────────────────────────────────────────────
// Runs before AppDataSource.initialize() so migrations start from a blank slate.
// Uses DATABASE_URL_UNPOOLED (loaded by data-source.ts import via dotenv).

async function preTruncate(): Promise<void> {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    // Drop all content tables and the migration tracking table so that
    // runMigrations() below starts from a clean slate.
    // admin_users is intentionally excluded — admin accounts survive reseeds.
    await client.query(`
      DROP TABLE IF EXISTS
        photos, albums,
        project_media, project_videos,
        post_tags, blog_posts, tags,
        experience_skills, project_skills,
        experience_entries,
        awards, certifications, patents, education_entries,
        projects, skills, resume_profile,
        migrations
      CASCADE
    `);
    console.log('  ✓ Dropped content tables + migrations tracking\n');
  } catch (e: unknown) {
    console.error('  ✗ Pre-drop failed:', (e as Error).message);
    throw e;
  } finally {
    await client.end().catch(() => {});
  }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🗑️  Pre-truncating tables…');
  await preTruncate();

  console.log('🔌 Connecting to database…');
  await AppDataSource.initialize();

  console.log('🔄 Running migrations…');
  const ranMigrations = await AppDataSource.runMigrations();
  console.log(`  ✓ Applied ${ranMigrations.length} migration(s)\n`);

  try {
    // ── 1. Skills (no deps) ───────────────────────────────────────────────
    const skillRepo = AppDataSource.getRepository(Skill);
    const skillMap = new Map<string, Skill>();

    for (const s of SKILLS_SEED) {
      const skill = await skillRepo.save(skillRepo.create(s));
      skillMap.set(s.name, skill);
    }
    console.log(`  ✓ Skills (${SKILLS_SEED.length})`);

    // ── 2. Resume profile ─────────────────────────────────────────────────
    const profileRepo = AppDataSource.getRepository(ResumeProfile);
    const profile = await profileRepo.save(profileRepo.create(PROFILE_SEED));
    console.log(`  ✓ ResumeProfile (slug: ${profile.slug})`);

    // ── 3. Experience entries (dep: profile + skills) ──────────────────────
    const expRepo = AppDataSource.getRepository(ExperienceEntry);
    for (const e of EXPERIENCE_SEED) {
      const skills = e.techStack
        .map((name) => skillMap.get(name))
        .filter((s): s is Skill => s !== undefined);

      await expRepo.save(
        expRepo.create({
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent,
          tasks: e.tasks,
          sortOrder: e.sortOrder,
          profile,
          skills,
        }),
      );
      console.log(`  ✓ Experience: ${e.title} @ ${e.company}`);
    }

    // ── 4. Education entries (dep: profile) ───────────────────────────────
    const eduRepo = AppDataSource.getRepository(EducationEntry);
    for (const ed of EDUCATION_SEED) {
      await eduRepo.save(eduRepo.create({ ...ed, profile }));
      console.log(`  ✓ Education: ${ed.degree}`);
    }

    // ── 5. Patents (dep: profile) ──────────────────────────────────────────
    const patentRepo = AppDataSource.getRepository(Patent);
    for (const p of PATENTS_SEED) {
      await patentRepo.save(patentRepo.create({ ...p, profile }));
      console.log(`  ✓ Patent: ${p.link}`);
    }

    // ── 6. Certifications (dep: profile) ──────────────────────────────────
    const certRepo = AppDataSource.getRepository(Certification);
    for (const c of CERTIFICATIONS_SEED) {
      await certRepo.save(certRepo.create({ ...c, profile }));
      console.log(`  ✓ Certification: ${c.title}`);
    }

    // ── 7. Awards (dep: profile) ───────────────────────────────────────────
    const awardRepo = AppDataSource.getRepository(Award);
    for (const a of AWARDS_SEED) {
      await awardRepo.save(awardRepo.create({ ...a, profile }));
      console.log(`  ✓ Award: ${a.title}`);
    }

    // ── 8. Projects (dep: skills only — no profile FK) ────────────────────
    const projectRepo = AppDataSource.getRepository(Project);
    for (const p of PROJECTS_SEED) {
      const skills = p.techStack
        .map((name) => skillMap.get(name))
        .filter((s): s is Skill => s !== undefined);

      await projectRepo.save(
        projectRepo.create({
          slug: p.slug,
          title: p.title,
          company: p.company ?? null,
          role: p.role ?? null,
          startDate: p.startDate ?? null,
          endDate: p.endDate ?? null,
          description: p.description ?? null,
          githubUrl: p.githubUrl ?? null,
          liveDemoUrl: p.liveDemoUrl ?? null,
          featured: p.featured,
          published: p.published,
          sortOrder: p.sortOrder,
          skills,
        }),
      );
      console.log(`  ✓ Project: ${p.title}`);
    }

    // ── 9. Gallery — default album + photos ───────────────────────────────
    const albumRepo = AppDataSource.getRepository(Album);
    const album = await albumRepo.save(albumRepo.create(DEFAULT_ALBUM));
    console.log(`  ✓ Album: ${DEFAULT_ALBUM.name}`);

    const photoRepo = AppDataSource.getRepository(Photo);
    for (const ph of PHOTOS_SEED) {
      await photoRepo.save(
        photoRepo.create({
          title: ph.title ?? null,
          location: ph.location ?? null,
          originalUrl: ph.originalUrl,
          thumbUrl: ph.thumbUrl,
          sortOrder: ph.sortOrder,
          published: true,
          album,
        }),
      );
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
