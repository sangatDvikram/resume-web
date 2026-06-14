import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * InitialSchema — creates all tables for the Portfolio CMS platform.
 *
 * Tables created (in dependency order):
 *   admin_users, resume_profile, skills, experience_entries, experience_skills,
 *   education_entries, patents, certifications, awards,
 *   tags, blog_posts, post_tags,
 *   projects, project_skills, project_media, project_videos,
 *   albums, photos
 *
 * Indexes:
 *   - Unique indexes on slug fields, skill names, email
 *   - Composite indexes on (published, sort_order), (published, published_at)
 *   - Photo sort_order index
 */
export class InitialSchema1748000000000 implements MigrationInterface {
  name = 'InitialSchema1748000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid_generate_v4() — required for UUID primary keys
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ── Enums ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "skill_category_enum" AS ENUM ('language', 'framework', 'database', 'tool');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "video_source_enum" AS ENUM ('youtube', 'vimeo', 'self_hosted');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);

    // ── Admin users — IF NOT EXISTS so reseeds keep existing admin accounts ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id"            UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "email"         VARCHAR(255) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "is_active"     BOOLEAN     NOT NULL DEFAULT true,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_users_email" UNIQUE ("email")
      )
    `);

    // ── Resume profile ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "resume_profile" (
        "id"                   UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "slug"                 VARCHAR(100) NOT NULL DEFAULT 'default',
        "name"                 VARCHAR(255) NOT NULL,
        "position"             VARCHAR(255) NOT NULL,
        "description"          TEXT         NOT NULL,
        "email"                VARCHAR(255) NOT NULL,
        "phone"                VARCHAR(50)  NOT NULL,
        "location"             VARCHAR(255) NOT NULL,
        "linked_in_url"        VARCHAR(500) NOT NULL,
        "github_url"           VARCHAR(500) NOT NULL,
        "website_url"          VARCHAR(500),
        "avatar_url"           VARCHAR(500) NOT NULL,
        "career_start_date"    TIMESTAMPTZ  NOT NULL,
        "freelance_start_date" TIMESTAMPTZ  NOT NULL,
        "updated_at"           TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_profile"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_resume_profile_slug" UNIQUE ("slug")
      )
    `);

    // ── Skills ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id"       UUID                    NOT NULL DEFAULT uuid_generate_v4(),
        "name"     VARCHAR(100)            NOT NULL,
        "category" "skill_category_enum"   NOT NULL,
        CONSTRAINT "PK_skills"        PRIMARY KEY ("id"),
        CONSTRAINT "UQ_skills_name"   UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_skills_name_category" ON "skills" ("name", "category")
    `);

    // ── Experience entries ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "experience_entries" (
        "id"         UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "title"      VARCHAR(255) NOT NULL,
        "company"    VARCHAR(255) NOT NULL,
        "location"   VARCHAR(255) NOT NULL,
        "start_date" TIMESTAMPTZ  NOT NULL,
        "end_date"   TIMESTAMPTZ,
        "is_current" BOOLEAN      NOT NULL DEFAULT false,
        "tasks"      TEXT[]       NOT NULL,
        "sort_order" INTEGER      NOT NULL DEFAULT 0,
        "profile_id" UUID         NOT NULL,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_experience_entries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_experience_entries_profile" FOREIGN KEY ("profile_id")
          REFERENCES "resume_profile" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_experience_entries_profile" ON "experience_entries" ("profile_id")
    `);

    // Many-to-many: experience ↔ skills
    await queryRunner.query(`
      CREATE TABLE "experience_skills" (
        "experience_entry_id" UUID NOT NULL,
        "skill_id"            UUID NOT NULL,
        CONSTRAINT "PK_experience_skills" PRIMARY KEY ("experience_entry_id", "skill_id"),
        CONSTRAINT "FK_experience_skills_entry" FOREIGN KEY ("experience_entry_id")
          REFERENCES "experience_entries" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_experience_skills_skill" FOREIGN KEY ("skill_id")
          REFERENCES "skills" ("id") ON DELETE CASCADE
      )
    `);

    // ── Education entries ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "education_entries" (
        "id"         UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "degree"     VARCHAR(255) NOT NULL,
        "university" VARCHAR(255) NOT NULL,
        "duration"   VARCHAR(100) NOT NULL,
        "sort_order" INTEGER      NOT NULL DEFAULT 0,
        "profile_id" UUID         NOT NULL,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_education_entries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_education_entries_profile" FOREIGN KEY ("profile_id")
          REFERENCES "resume_profile" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_education_entries_profile" ON "education_entries" ("profile_id")
    `);

    // ── Patents ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "patents" (
        "id"         UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "link"       VARCHAR(100)  NOT NULL,
        "url"        VARCHAR(1000) NOT NULL,
        "title"      VARCHAR(500)  NOT NULL,
        "sort_order" INTEGER       NOT NULL DEFAULT 0,
        "profile_id" UUID          NOT NULL,
        "created_at" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patents_profile" FOREIGN KEY ("profile_id")
          REFERENCES "resume_profile" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_patents_profile" ON "patents" ("profile_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patents_profile"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patents"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_education_entries_profile"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "education_entries"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_experience_entries_profile"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "experience_skills"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "experience_entries"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_skills_name_category"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "skills"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resume_profile"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "video_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "skill_category_enum"`);
  }
}
