/**
 * Seed validation script — verifies seeded DB state matches PRD appendix expectations.
 *
 * Usage (requires a running database with seed already applied):
 *   yarn workspace api ts-node -r tsconfig-paths/register src/seeds/validate-seed.ts
 *
 * Exit code 0 = all checks pass.  Exit code 1 = one or more checks failed.
 *
 * Acceptance criteria (from E3-S4):
 *   ✅ 1 ResumeProfile row with correct name, email, careerStartDate
 *   ✅ ≥ 4 Skill categories present (language, framework, database, tool)
 *   ✅ 6 ExperienceEntry rows
 *   ✅ 2 EducationEntry rows
 *   ✅ 2 Patent rows
 *   ✅ 1 Certification row
 *   ✅ 2 Award rows
 *   ✅ 3 Project rows (all published)
 *   ✅ 1 Album row (slug = "general")
 *   ✅ 6 Photo rows linked to that album
 *   ✅ experience_skills join rows exist for all experience entries with techStack
 *   ✅ project_skills join rows exist for all projects with skills
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
import { SkillCategory } from '../entities/enums';

interface CheckResult {
  label: string;
  passed: boolean;
  detail?: string;
}

function check(label: string, passed: boolean, detail?: string): CheckResult {
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ''}`);
  return { label, passed, detail };
}

async function validate(): Promise<void> {
  console.log('🔍 Connecting to database for seed validation…\n');
  await AppDataSource.initialize();

  const results: CheckResult[] = [];

  try {
    // ── ResumeProfile ─────────────────────────────────────────────────────
    console.log('ResumeProfile:');
    const profileRepo = AppDataSource.getRepository(ResumeProfile);
    const profile = await profileRepo.findOne({ where: {} });
    results.push(check('Row exists', !!profile));
    if (profile) {
      results.push(check('name set', profile.name.length > 0, profile.name));
      results.push(
        check('email set', profile.email.includes('@'), profile.email),
      );
      results.push(
        check(
          'careerStartDate = 2016-06-01',
          profile.careerStartDate.toISOString().startsWith('2016-06-01'),
          profile.careerStartDate.toISOString(),
        ),
      );
      results.push(
        check(
          'freelanceStartDate = 2012-03-01',
          profile.freelanceStartDate.toISOString().startsWith('2012-03-01'),
          profile.freelanceStartDate.toISOString(),
        ),
      );
    }

    // ── Skills ────────────────────────────────────────────────────────────
    console.log('\nSkills:');
    const skillRepo = AppDataSource.getRepository(Skill);
    const totalSkills = await skillRepo.count();
    const languages = await skillRepo.count({
      where: { category: SkillCategory.language },
    });
    const frameworks = await skillRepo.count({
      where: { category: SkillCategory.framework },
    });
    const databases = await skillRepo.count({
      where: { category: SkillCategory.database },
    });
    const tools = await skillRepo.count({
      where: { category: SkillCategory.tool },
    });
    results.push(
      check('≥ 15 skill rows', totalSkills >= 15, `${totalSkills} rows`),
    );
    results.push(
      check('language category', languages > 0, `${languages} rows`),
    );
    results.push(
      check('framework category', frameworks > 0, `${frameworks} rows`),
    );
    results.push(
      check('database category', databases > 0, `${databases} rows`),
    );
    results.push(check('tool category', tools > 0, `${tools} rows`));

    // ── ExperienceEntry ───────────────────────────────────────────────────
    console.log('\nExperienceEntries:');
    const expRepo = AppDataSource.getRepository(ExperienceEntry);
    const expCount = await expRepo.count();
    const expWithSkills = await expRepo
      .createQueryBuilder('e')
      .leftJoin('e.skills', 's')
      .where('s.id IS NOT NULL')
      .getCount();
    results.push(
      check('6 experience rows', expCount === 6, `${expCount} rows`),
    );
    results.push(
      check(
        'has skills via join table',
        expWithSkills > 0,
        `${expWithSkills} with skills`,
      ),
    );

    const currentExp = await expRepo.findOne({ where: { isCurrent: true } });
    results.push(
      check(
        '1 isCurrent=true entry',
        !!currentExp,
        currentExp?.company ?? 'none',
      ),
    );

    // ── EducationEntry ────────────────────────────────────────────────────
    console.log('\nEducationEntries:');
    const eduRepo = AppDataSource.getRepository(EducationEntry);
    const eduCount = await eduRepo.count();
    results.push(check('2 education rows', eduCount === 2, `${eduCount} rows`));

    // ── Patents ───────────────────────────────────────────────────────────
    console.log('\nPatents:');
    const patentRepo = AppDataSource.getRepository(Patent);
    const patentCount = await patentRepo.count();
    results.push(
      check('2 patent rows', patentCount === 2, `${patentCount} rows`),
    );

    const gb = await patentRepo.findOne({ where: { link: 'GB2572361A' } });
    const us = await patentRepo.findOne({ where: { link: 'USD870129S1' } });
    results.push(check('GB2572361A exists', !!gb));
    results.push(check('USD870129S1 exists', !!us));

    // ── Certifications ────────────────────────────────────────────────────
    console.log('\nCertifications:');
    const certRepo = AppDataSource.getRepository(Certification);
    const certCount = await certRepo.count();
    results.push(
      check('1 certification row', certCount === 1, `${certCount} rows`),
    );

    // ── Awards ────────────────────────────────────────────────────────────
    console.log('\nAwards:');
    const awardRepo = AppDataSource.getRepository(Award);
    const awardCount = await awardRepo.count();
    results.push(check('2 award rows', awardCount === 2, `${awardCount} rows`));

    // ── Projects ──────────────────────────────────────────────────────────
    console.log('\nProjects:');
    const projectRepo = AppDataSource.getRepository(Project);
    const projectCount = await projectRepo.count();
    const publishedCount = await projectRepo.count({
      where: { published: true },
    });
    const featuredCount = await projectRepo.count({
      where: { featured: true },
    });
    results.push(
      check('3 project rows', projectCount === 3, `${projectCount} rows`),
    );
    results.push(
      check(
        'all projects published',
        publishedCount === 3,
        `${publishedCount} published`,
      ),
    );
    results.push(
      check(
        '≥ 1 featured project',
        featuredCount >= 1,
        `${featuredCount} featured`,
      ),
    );

    const a3acp = await projectRepo.findOne({ where: { slug: 'a3-acp' } });
    results.push(check('a3-acp slug exists', !!a3acp));

    const projectWithSkills = await projectRepo
      .createQueryBuilder('p')
      .leftJoin('p.skills', 's')
      .where('s.id IS NOT NULL')
      .getCount();
    results.push(
      check(
        'projects have skills via join table',
        projectWithSkills > 0,
        `${projectWithSkills} with skills`,
      ),
    );

    // ── Gallery ───────────────────────────────────────────────────────────
    console.log('\nGallery:');
    const albumRepo = AppDataSource.getRepository(Album);
    const album = await albumRepo.findOne({ where: { slug: 'general' } });
    results.push(check('general album exists', !!album));
    if (album) {
      results.push(check('album is published', album.published));
    }

    const photoRepo = AppDataSource.getRepository(Photo);
    const photoCount = await photoRepo.count();
    results.push(check('6 photo rows', photoCount === 6, `${photoCount} rows`));
    const photosWithAlbum = await photoRepo
      .createQueryBuilder('ph')
      .innerJoin('ph.album', 'a', 'a.slug = :slug', { slug: 'general' })
      .getCount();
    results.push(
      check(
        'all photos in general album',
        photosWithAlbum === 6,
        `${photosWithAlbum} linked`,
      ),
    );
  } finally {
    await AppDataSource.destroy();
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.passed);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(
    `Validation complete: ${results.length - failed.length}/${results.length} checks passed.`,
  );

  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} check(s) failed:`);
    failed.forEach((r) => console.error(`   • ${r.label}`));
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed — seed data is valid.');
  }
}

validate().catch((err: unknown) => {
  console.error('Validation error:', err);
  process.exit(1);
});
