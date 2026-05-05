import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * InitialSchema part 3 — albums and photos (gallery).
 * Must run after 1748000000001-InitialSchema2.ts.
 */
export class InitialSchema31748000000002 implements MigrationInterface {
  name = 'InitialSchema31748000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Albums ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "albums" (
        "id"          UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "slug"        VARCHAR(300) NOT NULL,
        "name"        VARCHAR(255) NOT NULL,
        "description" TEXT,
        "location"    VARCHAR(255),
        "cover_id"    VARCHAR(36),
        "published"   BOOLEAN      NOT NULL DEFAULT false,
        "sort_order"  INTEGER      NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_albums"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_albums_slug" UNIQUE ("slug")
      )
    `);

    // ── Photos ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "photos" (
        "id"           UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "title"        VARCHAR(500),
        "alt_text"     VARCHAR(500),
        "location"     VARCHAR(255),
        "public_id"    VARCHAR(500),
        "original_url" VARCHAR(1000) NOT NULL,
        "thumb_url"    VARCHAR(1000) NOT NULL,
        "lqip_url"     VARCHAR(1000),
        "width"        INTEGER,
        "height"       INTEGER,
        "exif"         JSONB,
        "sort_order"   INTEGER       NOT NULL DEFAULT 0,
        "published"    BOOLEAN       NOT NULL DEFAULT true,
        "album_id"     UUID,
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_photos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_photos_album" FOREIGN KEY ("album_id")
          REFERENCES "albums" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_photos_sort_order" ON "photos" ("sort_order")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_photos_album_sort" ON "photos" ("album_id", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_photos_album_sort"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_photos_sort_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "photos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "albums"`);
  }
}
