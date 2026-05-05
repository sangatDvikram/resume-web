/**
 * Portfolio CMS — idempotent seed script.
 *
 * Usage:
 *   npm run seed           (from apps/api)
 *   yarn workspace api seed
 *
 * Running this script twice against the same database produces the same
 * result (upsert / skip-if-exists semantics for every entity).
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
import { slugify } from '../common/slug.util';

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🌱 Connecting to database…');
  await AppDataSource.initialize();

  try {
    // ── 1. Resume profile ─────────────────────────────────────────────────
    const profileRepo = AppDataSource.getRepository(ResumeProfile);
    let profile = await profileRepo.findOne({ where: {} });
    if (!profile) {
      profile = profileRepo.create(PROFILE_SEED);
      await profileRepo.save(profile);
      console.log('  ✓ ResumeProfile created');
    } else {
      console.log('  – ResumeProfile already exists, skipping');
    }

    // ── 2. Skills ─────────────────────────────────────────────────────────
    const skillRepo = AppDataSource.getRepository(Skill);
    const skillMap = new Map<string, Skill>();

    for (const s of SKILLS_SEED) {
      let skill = await skillRepo.findOne({ where: { name: s.name } });
      if (!skill) {
        skill = skillRepo.create(s);
        await skillRepo.save(skill);
        console.log(`  ✓ Skill: ${s.name}`);
      }
      skillMap.set(s.name, skill);
    }

    // ── 3. Experience entries ─────────────────────────────────────────────
    const expRepo = AppDataSource.getRepository(ExperienceEntry);
    for (const e of EXPERIENCE_SEED) {
      const existing = await expRepo.findOne({
        where: { title: e.title, company: e.company },
      });
      if (!existing) {
        const skills = e.techStack
          .map((name) => skillMap.get(name))
          .filter((s): s is Skill => s !== undefined);

        const entry = expRepo.create({
          title:     e.title,
          company:   e.company,
          location:  e.location,
          startDate: e.startDate,
          endDate:   e.endDate,
          isCurrent: e.isCurrent,
          tasks:     e.tasks,
          sortOrder: e.sortOrder,
          skills,
        });
        await expRepo.save(entry);
        console.log(`  ✓ Experience: ${e.title} @ ${e.company}`);
      } else {
        console.log(`  – Experience already exists: ${e.title} @ ${e.company}`);
      }
    }

    // ── 4. Education entries ──────────────────────────────────────────────
    const eduRepo = AppDataSource.getRepository(EducationEntry);
    for (const ed of EDUCATION_SEED) {
      const existing = await eduRepo.findOne({ where: { degree: ed.degree } });
      if (!existing) {
        await eduRepo.save(eduRepo.create(ed));
        console.log(`  ✓ Education: ${ed.degree}`);
      }
    }

    // ── 5. Patents ────────────────────────────────────────────────────────
    const patentRepo = AppDataSource.getRepository(Patent);
    for (const p of PATENTS_SEED) {
      const existing = await patentRepo.findOne({ where: { link: p.link } });
      if (!existing) {
        await patentRepo.save(patentRepo.create(p));
        console.log(`  ✓ Patent: ${p.link}`);
      }
    }

    // ── 6. Certifications ─────────────────────────────────────────────────
    const certRepo = AppDataSource.getRepository(Certification);
    for (const c of CERTIFICATIONS_SEED) {
      const existing = await certRepo.findOne({ where: { title: c.title } });
      if (!existing) {
        await certRepo.save(certRepo.create(c));
        console.log(`  ✓ Certification: ${c.title}`);
      }
    }

    // ── 7. Awards ─────────────────────────────────────────────────────────
    const awardRepo = AppDataSource.getRepository(Award);
    for (const a of AWARDS_SEED) {
      const existing = await awardRepo.findOne({ where: { title: a.title } });
      if (!existing) {
        await awardRepo.save(awardRepo.create(a));
        console.log(`  ✓ Award: ${a.title}`);
      }
    }

    // ── 8. Projects ───────────────────────────────────────────────────────
    const projectRepo = AppDataSource.getRepository(Project);
    for (const p of PROJECTS_SEED) {
      const existing = await projectRepo.findOne({ where: { slug: p.slug } });
      if (!existing) {
        const skills = p.techStack
          .map((name) => skillMap.get(name))
          .filter((s): s is Skill => s !== undefined);

        const project = projectRepo.create({
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
        });
        await projectRepo.save(project);
        console.log(`  ✓ Project: ${p.title}`);
      } else {
        console.log(`  – Project already exists: ${p.title}`);
      }
    }

    // ── 9. Gallery — default album + photos ───────────────────────────────
    const albumRepo = AppDataSource.getRepository(Album);
    let album = await albumRepo.findOne({ where: { slug: DEFAULT_ALBUM.slug } });
    if (!album) {
      album = albumRepo.create(DEFAULT_ALBUM);
      await albumRepo.save(album);
      console.log(`  ✓ Album: ${DEFAULT_ALBUM.name}`);
    }

    const photoRepo = AppDataSource.getRepository(Photo);
    for (const ph of PHOTOS_SEED) {
      const existing = await photoRepo.findOne({
        where: { originalUrl: ph.originalUrl },
      });
      if (!existing) {
        const photo = photoRepo.create({
          title:       ph.title ?? null,
          location:    ph.location ?? null,
          originalUrl: ph.originalUrl,
          thumbUrl:    ph.thumbUrl,
          sortOrder:   ph.sortOrder,
          published:   true,
          album,
        });
        await photoRepo.save(photo);
        console.log(`  ✓ Photo: ${ph.title ?? ph.sortOrder}`);
      }
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
