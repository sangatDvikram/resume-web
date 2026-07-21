/**
 * Portfolio CMS — idempotent migrate-seed script.
 *
 * Usage:
 *   yarn workspace api seed
 *
 * Flow:
 *   1. AppDataSource.initialize() + runMigrations() — no tables are dropped.
 *   2. Seed data in FK-dependency order; each record is looked up by its
 *      natural key first and only created if it doesn't already exist.
 *      Existing records are left untouched (not upserted/overwritten).
 *
 * Seed order:
 *   Skills → ResumeProfile → Experience/Education/Patent/Cert/Award
 *   → Projects → Gallery → Blog (Tags → Posts)
 */

import 'reflect-metadata';
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
import { BlogPost } from '../entities/blog-post.entity';
import { Tag } from '../entities/tag.entity';
import { generateSlug } from '../common/slug.util';
import { renderMarkdown, estimateReadingTime } from '../common/markdown.util';
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
  BLOG_TAGS_SEED,
  BLOG_POSTS_SEED,
} from './seed-data';

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🔌 Connecting to database…');
  await AppDataSource.initialize();

  console.log('🔄 Running migrations…');
  const ranMigrations = await AppDataSource.runMigrations();
  console.log(`  ✓ Applied ${ranMigrations.length} migration(s)\n`);

  try {
    // ── 1. Skills (no deps) — unique key: name ──────────────────────────────
    const skillRepo = AppDataSource.getRepository(Skill);
    const skillMap = new Map<string, Skill>();

    for (const s of SKILLS_SEED) {
      let skill = await skillRepo.findOne({ where: { name: s.name } });
      if (!skill) {
        skill = await skillRepo.save(skillRepo.create(s));
        console.log(`  ✓ Skill created: ${s.name}`);
      } else {
        console.log(`  · Skill exists, skipped: ${s.name}`);
      }
      skillMap.set(s.name, skill);
    }

    // ── 2. Resume profile — unique key: slug ────────────────────────────────
    const profileRepo = AppDataSource.getRepository(ResumeProfile);
    let profile = await profileRepo.findOne({
      where: { slug: PROFILE_SEED.slug },
    });
    if (!profile) {
      profile = await profileRepo.save(profileRepo.create(PROFILE_SEED));
      console.log(`  ✓ ResumeProfile created (slug: ${profile.slug})`);
    } else {
      console.log(`  · ResumeProfile exists, skipped (slug: ${profile.slug})`);
    }

    // ── 3. Experience entries — key: title + company ────────────────────────
    const expRepo = AppDataSource.getRepository(ExperienceEntry);
    for (const e of EXPERIENCE_SEED) {
      const exists = await expRepo.findOne({
        where: { title: e.title, company: e.company },
      });
      if (exists) {
        console.log(`  · Experience exists, skipped: ${e.title} @ ${e.company}`);
        continue;
      }

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
      console.log(`  ✓ Experience created: ${e.title} @ ${e.company}`);
    }

    // ── 4. Education entries — key: degree + university ─────────────────────
    const eduRepo = AppDataSource.getRepository(EducationEntry);
    for (const ed of EDUCATION_SEED) {
      const exists = await eduRepo.findOne({
        where: { degree: ed.degree, university: ed.university },
      });
      if (exists) {
        console.log(`  · Education exists, skipped: ${ed.degree}`);
        continue;
      }
      await eduRepo.save(eduRepo.create({ ...ed, profile }));
      console.log(`  ✓ Education created: ${ed.degree}`);
    }

    // ── 5. Patents — key: link (patent number) ───────────────────────────────
    const patentRepo = AppDataSource.getRepository(Patent);
    for (const p of PATENTS_SEED) {
      const exists = await patentRepo.findOne({ where: { link: p.link } });
      if (exists) {
        console.log(`  · Patent exists, skipped: ${p.link}`);
        continue;
      }
      await patentRepo.save(patentRepo.create({ ...p, profile }));
      console.log(`  ✓ Patent created: ${p.link}`);
    }

    // ── 6. Certifications — key: title + issuer ──────────────────────────────
    const certRepo = AppDataSource.getRepository(Certification);
    for (const c of CERTIFICATIONS_SEED) {
      const exists = await certRepo.findOne({
        where: { title: c.title, issuer: c.issuer },
      });
      if (exists) {
        console.log(`  · Certification exists, skipped: ${c.title}`);
        continue;
      }
      await certRepo.save(certRepo.create({ ...c, profile }));
      console.log(`  ✓ Certification created: ${c.title}`);
    }

    // ── 7. Awards — key: title + issuer ──────────────────────────────────────
    const awardRepo = AppDataSource.getRepository(Award);
    for (const a of AWARDS_SEED) {
      const exists = await awardRepo.findOne({
        where: { title: a.title, issuer: a.issuer },
      });
      if (exists) {
        console.log(`  · Award exists, skipped: ${a.title}`);
        continue;
      }
      await awardRepo.save(awardRepo.create({ ...a, profile }));
      console.log(`  ✓ Award created: ${a.title}`);
    }

    // ── 8. Projects — key: slug ───────────────────────────────────────────────
    const projectRepo = AppDataSource.getRepository(Project);
    for (const p of PROJECTS_SEED) {
      const exists = await projectRepo.findOne({ where: { slug: p.slug } });
      if (exists) {
        console.log(`  · Project exists, skipped: ${p.title}`);
        continue;
      }

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
      console.log(`  ✓ Project created: ${p.title}`);
    }

    // ── 9. Gallery — default album (key: slug) + photos (key: originalUrl) ──
    const albumRepo = AppDataSource.getRepository(Album);
    let album = await albumRepo.findOne({ where: { slug: DEFAULT_ALBUM.slug } });
    if (!album) {
      album = await albumRepo.save(albumRepo.create(DEFAULT_ALBUM));
      console.log(`  ✓ Album created: ${DEFAULT_ALBUM.name}`);
    } else {
      console.log(`  · Album exists, skipped: ${DEFAULT_ALBUM.name}`);
    }

    const photoRepo = AppDataSource.getRepository(Photo);
    for (const ph of PHOTOS_SEED) {
      const exists = await photoRepo.findOne({
        where: { originalUrl: ph.originalUrl },
      });
      if (exists) {
        console.log(`  · Photo exists, skipped: ${ph.title ?? ph.sortOrder}`);
        continue;
      }
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
      console.log(`  ✓ Photo created: ${ph.title ?? ph.sortOrder}`);
    }

    // ── 10. Blog — tags (key: name) + posts (key: title) ────────────────────
    const tagRepo = AppDataSource.getRepository(Tag);
    const tagMap = new Map<string, Tag>();
    for (const name of BLOG_TAGS_SEED) {
      let tag = await tagRepo.findOne({ where: { name } });
      if (!tag) {
        tag = await tagRepo.save(tagRepo.create({ name }));
        console.log(`  ✓ Tag created: ${name}`);
      } else {
        console.log(`  · Tag exists, skipped: ${name}`);
      }
      tagMap.set(name, tag);
    }

    const blogRepo = AppDataSource.getRepository(BlogPost);
    for (const p of BLOG_POSTS_SEED) {
      const exists = await blogRepo.findOne({ where: { title: p.title } });
      if (exists) {
        console.log(`  · Blog post exists, skipped: ${p.title}`);
        continue;
      }

      const tags = p.tags
        .map((name) => tagMap.get(name))
        .filter((t): t is Tag => t !== undefined);

      await blogRepo.save(
        blogRepo.create({
          slug: generateSlug(p.title),
          title: p.title,
          excerpt: p.excerpt,
          coverImageUrl: p.coverImageUrl,
          rawMarkdown: p.rawMarkdown,
          htmlContent: await renderMarkdown(p.rawMarkdown),
          readingTime: estimateReadingTime(p.rawMarkdown),
          published: p.published,
          publishedAt: p.publishedAt,
          tags,
        }),
      );
      console.log(`  ✓ Blog post created: ${p.title}`);
    }

    console.log('\n✅ Seed complete — database is up to date.');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((err: unknown) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
