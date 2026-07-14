# Templates

Copy these verbatim and substitute placeholders (`Xxx` = PascalCase entity name, `xxx` = camelCase, `xxxs`/`resource` = route/plural). They're lifted from the real `gallery` and `blog` modules — deviate only where the resource genuinely differs (e.g. no pagination needed, no public page).

Two real modules to read directly if a template here doesn't cover a case: `apps/api/src/gallery/` (multi-entity, cursor pagination, file upload sub-routes) and `apps/api/src/blog/` (single primary entity + tag relation, no pagination, simplest full example).

## entity

`apps/api/src/entities/xxx.entity.ts`:

```ts
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('xxxs')
export class Xxx extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 300 })
  slug!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: false })
  published!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
```

For a child entity with a parent relation (mirrors `Photo` → `Album`), use string-based lazy relations with `import type` for the cross-entity type to dodge circular imports:

```ts
import type { Xxx } from './xxx.entity';

@ManyToOne('Xxx', (p: Xxx) => p.children, { onDelete: 'SET NULL', nullable: true })
@JoinColumn({ name: 'xxx_id' })
parent!: Xxx | null;
```

and on the parent:

```ts
@OneToMany('Child', (c: Child) => c.parent)
children!: Child[];
```

## barrel

Add one line to `apps/api/src/entities/index.ts`, under the matching feature-domain banner (or a new `// ─── <Domain> ───` banner appended at the bottom if this is a new domain):

```ts
export { Xxx } from './xxx.entity';
```

## migration

`apps/api/src/migrations/<timestamp>-CreateXxxs.ts` — check the newest file in `apps/api/src/migrations/` for the current timestamp scheme and pick the next one up:

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateXxxs<timestamp> implements MigrationInterface {
  name = 'CreateXxxs<timestamp>';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "xxxs" (
        "id"          UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "slug"        VARCHAR(300) NOT NULL,
        "name"        VARCHAR(255) NOT NULL,
        "description" TEXT,
        "published"   BOOLEAN      NOT NULL DEFAULT false,
        "sort_order"  INTEGER      NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_xxxs"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_xxxs_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_xxxs_sort_order" ON "xxxs" ("sort_order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_xxxs_sort_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "xxxs"`);
  }
}
```

`down()` always reverses `up()` in exact opposite order (drop indexes before the table, drop child tables before parent tables). Quote every identifier; snake_case column names; `PK_`/`UQ_`/`FK_`/`IDX_` prefix convention on constraint/index names.

## dto

`apps/api/src/xxx/dto/xxx.dto.ts`:

```ts
import { IsBoolean, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateXxxDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateXxxDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

// Response shapes are plain interfaces, not classes — no validation needed on the way out.
export interface XxxDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string; // ISO string — map Date -> string explicitly, don't pass entities straight through
  updatedAt: string;
}
```

If the resource is unbounded/large (needs cursor pagination like gallery photos), also add:

```ts
export interface XxxPageDto {
  items: XxxDto[];
  nextCursor: string | null;
  total: number;
}
```

## service

`apps/api/src/xxx/xxx.service.ts` — small/bounded collection, no pagination (mirrors blog):

```ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Xxx } from '../entities/xxx.entity';
import { generateSlug } from '../common/slug.util';
import { CreateXxxDto, UpdateXxxDto, XxxDto } from './dto/xxx.dto';

@Injectable()
export class XxxService {
  private readonly logger = new Logger(XxxService.name);

  constructor(
    @InjectRepository(Xxx)
    private readonly xxxRepo: Repository<Xxx>,
    private readonly config: ConfigService,
  ) {}

  async findAllPublished(): Promise<XxxDto[]> {
    const rows = await this.xxxRepo.find({ where: { published: true }, order: { sortOrder: 'ASC' } });
    return rows.map(toDto);
  }

  async findAll(): Promise<XxxDto[]> {
    const rows = await this.xxxRepo.find({ order: { sortOrder: 'ASC' } });
    return rows.map(toDto);
  }

  async findBySlug(slug: string): Promise<XxxDto> {
    const row = await this.xxxRepo.findOne({ where: { slug } });
    if (!row) throw new NotFoundException(`Xxx "${slug}" not found`);
    return toDto(row);
  }

  async create(dto: CreateXxxDto): Promise<XxxDto> {
    const row = this.xxxRepo.create({ ...dto, slug: generateSlug(dto.name) });
    const saved = await this.xxxRepo.save(row);
    void this.revalidate(['xxxs']);
    return toDto(saved);
  }

  async update(id: string, dto: UpdateXxxDto): Promise<XxxDto> {
    const row = await this.xxxRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Xxx "${id}" not found`);
    Object.assign(row, dto); // slug is never touched on update — see slug.util convention
    const saved = await this.xxxRepo.save(row);
    void this.revalidate(['xxxs', `xxxs-${saved.slug}`]);
    return toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.xxxRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Xxx "${id}" not found`);
    void this.revalidate(['xxxs']);
  }

  // Omit this method entirely if the resource has no public-facing page.
  private async revalidate(tags: string[] = ['xxxs']): Promise<void> {
    const revalidateUrl = this.config.get<string>('NEXT_REVALIDATE_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    if (!revalidateUrl || !secret) {
      this.logger.warn('NEXT_REVALIDATE_URL or REVALIDATE_SECRET not set — skipping ISR revalidation.');
      return;
    }
    try {
      const res = await fetch(revalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, secret }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) this.logger.warn(`ISR revalidation returned ${res.status} for tags: ${tags.join(', ')}`);
      else this.logger.log(`ISR revalidated: ${tags.join(', ')}`);
    } catch (err) {
      this.logger.error('ISR revalidation fetch failed', err);
    }
  }
}

function toDto(row: Xxx): XxxDto {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
```

For unbounded collections, copy gallery's cursor pattern instead of `findAll()`:

```ts
const PAGE_SIZE = 24;

async listXxxs(cursor?: string): Promise<XxxPageDto> {
  const offset = cursor ? Number(Buffer.from(cursor, 'base64').toString('utf8')) : 0;
  const [rows, total] = await this.xxxRepo.findAndCount({
    order: { sortOrder: 'ASC' },
    skip: offset,
    take: PAGE_SIZE + 1, // overfetch by 1 to detect hasMore
  });
  const hasMore = rows.length > PAGE_SIZE;
  const slice = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? Buffer.from(String(offset + PAGE_SIZE)).toString('base64') : null;
  return { items: slice.map(toDto), nextCursor, total };
}
```

## controller

`apps/api/src/xxx/xxx.controller.ts`:

```ts
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { XxxService } from './xxx.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateXxxDto, UpdateXxxDto } from './dto/xxx.dto';

@Controller('xxxs')
export class XxxController {
  constructor(private readonly xxxService: XxxService) {}

  // ── Public endpoints ───────────────────────────────────────────────────────

  /** GET /v1/xxxs — published only, cached by Next.js ISR with the "xxxs" tag. */
  @Get()
  findAll() {
    return this.xxxService.findAllPublished();
  }

  /** GET /v1/xxxs/:slug — must come after any static sibling routes (e.g. GET /xxxs/admin). */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.xxxService.findBySlug(slug);
  }

  // ── Admin endpoints (auth required) ───────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.xxxService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateXxxDto) {
    return this.xxxService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateXxxDto) {
    return this.xxxService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.xxxService.remove(id);
  }
}
```

If routing puts a static path under the same prefix as `:slug`/`:id` (like blog's `tags` or gallery's `admin/albums`), declare the static route earlier in the class — NestJS matches in declaration order and a `:slug` catch-all declared first will shadow it.

## module

`apps/api/src/xxx/xxx.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Xxx } from '../entities/xxx.entity';
import { XxxService } from './xxx.service';
import { XxxController } from './xxx.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Xxx])],
  providers: [XxxService],
  controllers: [XxxController],
  exports: [XxxService],
})
export class XxxModule {}
```

List every entity the service injects (not just the primary one) in `forFeature([...])` — e.g. if `Xxx` has a many-to-many with `Tag`, include `Tag` too, same as blog's module includes both `BlogPost` and `Tag`.

## spec

`apps/api/src/xxx/xxx.service.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { XxxService } from './xxx.service';
import { Xxx } from '../entities/xxx.entity';

jest.mock('../common/slug.util', () => ({
  generateSlug: jest.fn().mockReturnValue('test-xxx'),
}));

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

function makeXxx(overrides: Partial<Xxx> = {}): Xxx {
  return {
    id: 'xxx-id',
    slug: 'test-xxx',
    name: 'Test Xxx',
    description: null,
    published: true,
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as Xxx;
}

describe('XxxService', () => {
  let service: XxxService;
  let xxxRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    xxxRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XxxService,
        { provide: getRepositoryToken(Xxx), useValue: xxxRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = module.get(XxxService);
  });

  describe('findAllPublished', () => {
    it('returns published xxxs', async () => {
      xxxRepo.find.mockResolvedValue([makeXxx()]);
      const result = await service.findAllPublished();
      expect(result).toHaveLength(1);
    });

    it('returns empty array when none exist', async () => {
      xxxRepo.find.mockResolvedValue([]);
      const result = await service.findAllPublished();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when id does not exist', async () => {
      xxxRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
```

`ConfigService.get` mocked to always return `undefined` so `revalidate()` hits its "not configured" branch and returns early — no real network call fires during tests.
