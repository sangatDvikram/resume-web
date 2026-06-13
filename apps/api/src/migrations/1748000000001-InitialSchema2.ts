import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * InitialSchema part 2 — certifications, awards, blog, projects, gallery.
 * Must run after 1748000000000-InitialSchema.ts.
 */
export class InitialSchema21748000000001 implements MigrationInterface {
  name = 'InitialSchema21748000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Certifications ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "certifications" (
        "id"         UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "title"      VARCHAR(500)  NOT NULL,
        "issuer"     VARCHAR(255)  NOT NULL,
        "link"       VARCHAR(1000),
        "sort_order" INTEGER       NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_certifications" PRIMARY KEY ("id")
      )
    `);

    // ── Awards ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "awards" (
        "id"         UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "title"      VARCHAR(500) NOT NULL,
        "issuer"     VARCHAR(255) NOT NULL,
        "sort_order" INTEGER      NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_awards" PRIMARY KEY ("id")
      )
    `);

    // ── Tags ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id"   UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        CONSTRAINT "PK_tags"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name")
      )
    `);

    // ── Blog posts ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id"              UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "slug"            VARCHAR(300)  NOT NULL,
        "title"           VARCHAR(500)  NOT NULL,
        "excerpt"         TEXT,
        "cover_image_url" VARCHAR(1000),
        "raw_markdown"    TEXT          NOT NULL,
        "html_content"    TEXT          NOT NULL,
        "reading_time"    INTEGER,
        "published"       BOOLEAN       NOT NULL DEFAULT false,
        "published_at"    TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_posts"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_blog_posts_published_at" ON "blog_posts" ("published", "published_at")
    `);

    // Many-to-many: blog_posts ↔ tags
    await queryRunner.query(`
      CREATE TABLE "post_tags" (
        "blog_post_id" UUID NOT NULL,
        "tag_id"       UUID NOT NULL,
        CONSTRAINT "PK_post_tags" PRIMARY KEY ("blog_post_id", "tag_id"),
        CONSTRAINT "FK_post_tags_post" FOREIGN KEY ("blog_post_id")
          REFERENCES "blog_posts" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_tags_tag"  FOREIGN KEY ("tag_id")
          REFERENCES "tags" ("id") ON DELETE CASCADE
      )
    `);

    // ── Projects ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id"               UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "slug"             VARCHAR(300)  NOT NULL,
        "title"            VARCHAR(500)  NOT NULL,
        "company"          VARCHAR(255),
        "role"             VARCHAR(255),
        "start_date"       TIMESTAMPTZ,
        "end_date"         TIMESTAMPTZ,
        "description"      TEXT,
        "html_description" TEXT,
        "github_url"       VARCHAR(1000),
        "live_demo_url"    VARCHAR(1000),
        "featured"         BOOLEAN       NOT NULL DEFAULT false,
        "published"        BOOLEAN       NOT NULL DEFAULT false,
        "sort_order"       INTEGER       NOT NULL DEFAULT 0,
        "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_projects_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_projects_published_sort" ON "projects" ("published", "sort_order")
    `);

    // Many-to-many: projects ↔ skills
    await queryRunner.query(`
      CREATE TABLE "project_skills" (
        "project_id" UUID NOT NULL,
        "skill_id"   UUID NOT NULL,
        CONSTRAINT "PK_project_skills" PRIMARY KEY ("project_id", "skill_id"),
        CONSTRAINT "FK_project_skills_project" FOREIGN KEY ("project_id")
          REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_skills_skill"   FOREIGN KEY ("skill_id")
          REFERENCES "skills" ("id") ON DELETE CASCADE
      )
    `);

    // ── Project media ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "project_media" (
        "id"         UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "url"        VARCHAR(1000) NOT NULL,
        "alt_text"   VARCHAR(500),
        "sort_order" INTEGER       NOT NULL DEFAULT 0,
        "project_id" UUID,
        CONSTRAINT "PK_project_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_media_project" FOREIGN KEY ("project_id")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);

    // ── Project videos ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "project_videos" (
        "id"         UUID                  NOT NULL DEFAULT uuid_generate_v4(),
        "source"     "video_source_enum"   NOT NULL,
        "url"        VARCHAR(1000)         NOT NULL,
        "title"      VARCHAR(500),
        "sort_order" INTEGER               NOT NULL DEFAULT 0,
        "project_id" UUID,
        CONSTRAINT "PK_project_videos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_videos_project" FOREIGN KEY ("project_id")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "project_videos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_media"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_skills"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_projects_published_sort"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_tags"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_blog_posts_published_at"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "awards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "certifications"`);
  }
}
