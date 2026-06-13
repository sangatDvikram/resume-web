import path from 'path';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { AdminUserService } from '../admin-user/admin-user.service';
import { AdminUser } from '../admin-user/admin-user.entity';
import {
  ResumeProfile,
  Skill,
  ExperienceEntry,
  EducationEntry,
  Patent,
  Certification,
  Award,
  Tag,
  BlogPost,
  Project,
  ProjectMedia,
  ProjectVideo,
  Album,
  Photo,
} from '../entities';

/**
 * AdminJS v7 and its adapters are ESM-only; NestJS compiles to CommonJS.
 * TypeScript transforms import() → require() in CommonJS mode, which breaks
 * ESM-only packages that only expose an "import" export condition.
 * new Function('return import(m)') is evaluated at runtime by Node.js as a
 * true native ESM dynamic import, bypassing the TypeScript compiler.
 */
@Module({})
export class AdminJsModule {
  static async createAsync(): Promise<DynamicModule> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const esmImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;

    // Type assertions are used here because typeof import() requires moduleResolution
    // node16/nodenext/bundler, which is incompatible with NestJS's CommonJS output.
    const { AdminModule } = await esmImport('@adminjs/nestjs') as { AdminModule: any };
    const { default: AdminJS, ComponentLoader, BaseRecord: AdminBaseRecord } = await esmImport('adminjs') as { default: any; ComponentLoader: any; BaseRecord: any };
    const { Database, Resource: TypeOrmResource } = await esmImport('@adminjs/typeorm') as { Database: any; Resource: any };

    // ── M2M helper ────────────────────────────────────────────────────────────
    // Returns the submitted IDs for a M2M field, or null if the field was not
    // touched (so we can distinguish "unchanged" from "cleared").
    // The SkillPicker / TagPicker emit '__empty__' when the user removes all items.
    function extractM2MIds(params: Record<string, any>, field: string): string[] | null {
      const keys = Object.keys(params).filter((k) => new RegExp(`^${field}\\.\\d+$`).test(k));
      if (keys.length === 0) return null;
      return keys
        .map((k) => params[k] as string)
        .filter((id) => id && id !== '__empty__');
    }

    // ── ProjectResource ───────────────────────────────────────────────────────
    // Overrides findOne/update/create so that the skills M2M relation is loaded
    // for display and correctly persisted on save (the base TypeORM adapter only
    // handles scalar columns; it silently ignores M2M join tables).
    class ProjectResource extends (TypeOrmResource as any) {
      private _ds: DataSource;
      constructor(model: any, ds: DataSource) { super(model); this._ds = ds; }

      async findOne(id: string) {
        const instance = await this._ds
          .getRepository(Project)
          .findOne({ where: { id }, relations: ['skills'] });
        if (!instance) return null;
        return new (AdminBaseRecord as any)(instance, this);
      }

      async update(pk: string, params: Record<string, any> = {}) {
        const skillIds = extractM2MIds(params, 'skills');
        const clean = Object.fromEntries(
          Object.entries(params).filter(([k]) => !/^skills(\..*)?$/.test(k)),
        );
        const result = await super.update(pk, clean);
        if (skillIds !== null) {
          const pr = this._ds.getRepository(Project);
          const sr = this._ds.getRepository(Skill);
          const p = await pr.findOne({ where: { id: pk }, relations: ['skills'] });
          if (p) {
            p.skills = skillIds.length ? await sr.findBy({ id: In(skillIds) }) : [];
            await pr.save(p);
          }
        }
        return result;
      }

      async create(params: Record<string, any>) {
        const skillIds = extractM2MIds(params, 'skills');
        const clean = Object.fromEntries(
          Object.entries(params).filter(([k]) => !/^skills(\..*)?$/.test(k)),
        );
        const result = await super.create(clean);
        if (skillIds?.length && result?.id) {
          const pr = this._ds.getRepository(Project);
          const sr = this._ds.getRepository(Skill);
          const p = await pr.findOne({ where: { id: result.id }, relations: ['skills'] });
          if (p) { p.skills = await sr.findBy({ id: In(skillIds) }); await pr.save(p); }
        }
        return result;
      }
    }

    // ── BlogPostResource ──────────────────────────────────────────────────────
    // Same pattern for the tags M2M on BlogPost.
    class BlogPostResource extends (TypeOrmResource as any) {
      private _ds: DataSource;
      constructor(model: any, ds: DataSource) { super(model); this._ds = ds; }

      async findOne(id: string) {
        const instance = await this._ds
          .getRepository(BlogPost)
          .findOne({ where: { id }, relations: ['tags'] });
        if (!instance) return null;
        return new (AdminBaseRecord as any)(instance, this);
      }

      async update(pk: string, params: Record<string, any> = {}) {
        const tagIds = extractM2MIds(params, 'tags');
        const clean = Object.fromEntries(
          Object.entries(params).filter(([k]) => !/^tags(\..*)?$/.test(k)),
        );
        const result = await super.update(pk, clean);
        if (tagIds !== null) {
          const br = this._ds.getRepository(BlogPost);
          const tr = this._ds.getRepository(Tag);
          const post = await br.findOne({ where: { id: pk }, relations: ['tags'] });
          if (post) {
            post.tags = tagIds.length ? await tr.findBy({ id: In(tagIds) }) : [];
            await br.save(post);
          }
        }
        return result;
      }

      async create(params: Record<string, any>) {
        const tagIds = extractM2MIds(params, 'tags');
        const clean = Object.fromEntries(
          Object.entries(params).filter(([k]) => !/^tags(\..*)?$/.test(k)),
        );
        const result = await super.create(clean);
        if (tagIds?.length && result?.id) {
          const br = this._ds.getRepository(BlogPost);
          const tr = this._ds.getRepository(Tag);
          const post = await br.findOne({ where: { id: result.id }, relations: ['tags'] });
          if (post) { post.tags = await tr.findBy({ id: In(tagIds) }); await br.save(post); }
        }
        return result;
      }
    }

    AdminJS.registerAdapter({ Database, Resource: TypeOrmResource });

    // ── Custom component registration ────────────────────────────────────────
    // ComponentLoader is created once and shared via closure into useFactory.
    // AdminJS's internal esbuild bundler compiles these .tsx files at startup.
    const componentLoader = new ComponentLoader();
    const componentsDir   = path.join(__dirname, 'components');

    const MarkdownEditorComp = componentLoader.add(
      'MarkdownEditor',
      path.join(componentsDir, 'markdown-editor'),
    );
    const TagPickerComp = componentLoader.add(
      'TagPicker',
      path.join(componentsDir, 'tag-picker'),
    );
    const SkillPickerComp = componentLoader.add(
      'SkillPicker',
      path.join(componentsDir, 'skill-picker'),
    );
    const MediaUploaderComp = componentLoader.add(
      'MediaUploader',
      path.join(componentsDir, 'media-uploader'),
    );
    const VideoManagerComp = componentLoader.add(
      'VideoManager',
      path.join(componentsDir, 'video-manager'),
    );
    const PhotoUploaderComp = componentLoader.add(
      'PhotoUploader',
      path.join(componentsDir, 'photo-uploader'),
    );
    const DashboardComp = componentLoader.add(
      'Dashboard',
      path.join(componentsDir, 'dashboard'),
    );

    return {
      module: AdminJsModule,
      imports: [
        AdminUserModule,
        AdminModule.createAdminAsync({
          imports: [AdminUserModule],
          useFactory: (
            adminUserService: AdminUserService,
            config: ConfigService,
            dataSource: DataSource,
          ) => {
            // TypeORM 0.3.x BaseEntity.getRepository() requires the DataSource
            // to be explicitly registered on the entity class. NestJS's Data
            // Mapper integration never calls useDataSource(), so we do it here
            // before AdminJS builds its resource list in onModuleInit.
            const entities = [
              AdminUser,
              ResumeProfile, Skill, ExperienceEntry, EducationEntry,
              Patent, Certification, Award,
              Tag, BlogPost,
              Project, ProjectMedia, ProjectVideo,
              Album, Photo,
            ];
            for (const entity of entities) {
              entity.useDataSource(dataSource);
            }

            /** Shared after-hook factory: revalidates given tags and passes through. */
            const makeAfterHook = (tags: string[]) => async (response: any) => {
              const revalidateUrl = config.get<string>('NEXT_REVALIDATE_URL');
              const secret = config.get<string>('REVALIDATE_SECRET');
              if (!revalidateUrl || !secret) return response;
              try {
                await fetch(revalidateUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tags, secret }),
                  signal: AbortSignal.timeout(5_000),
                });
              } catch (e) {
                console.error('AdminJS ISR revalidation failed', e);
              }
              return response;
            };

            const afterResume   = makeAfterHook(['resume']);
            const afterBlog     = makeAfterHook(['blog']);
            const afterProjects = makeAfterHook(['projects']);
            const afterGallery  = makeAfterHook(['gallery']);

            /** Resume mutation hooks — applied to edit, new, delete */
            const resumeActions = {
              edit:   { after: afterResume },
              new:    { after: afterResume },
              delete: { after: afterResume },
            };

            /** Blog mutation hooks */
            const blogActions = {
              edit:   { after: afterBlog },
              new:    { after: afterBlog },
              delete: { after: afterBlog },
            };

            /** Project mutation hooks */
            const projectActions = {
              edit:   { after: afterProjects },
              new:    { after: afterProjects },
              delete: { after: afterProjects },
            };

            return {
              adminJsOptions: {
                rootPath: '/admin',
                componentLoader,
                dashboard: {
                  component: DashboardComp,
                },
                branding: {
                  companyName: 'Portfolio CMS',
                  logo: false,
                  withMadeWithLove: false,
                  favicon: '/apple-icon-57x57.png',
                },
                resources: [
                  // ── Auth ─────────────────────────────────────────────────
                  {
                    resource: AdminUser,
                    options: {
                      properties: { passwordHash: { isVisible: false } },
                    },
                  },
                  // ── Resume ───────────────────────────────────────────────
                  {
                    resource: ResumeProfile,
                    options: {
                      actions: resumeActions,
                      editProperties: [
                        'name', 'position', 'description', 'email', 'phone',
                        'location', 'linkedInUrl', 'githubUrl', 'websiteUrl',
                        'avatarUrl', 'careerStartDate', 'freelanceStartDate',
                      ],
                    },
                  },
                  {
                    resource: Skill,
                    options: {
                      actions: resumeActions,
                      listProperties: ['name', 'category'],
                      editProperties: ['name', 'category'],
                    },
                  },
                  {
                    resource: ExperienceEntry,
                    options: {
                      actions: resumeActions,
                      listProperties: ['title', 'company', 'location', 'isCurrent', 'sortOrder'],
                      editProperties: [
                        'title', 'company', 'location', 'startDate', 'endDate',
                        'isCurrent', 'tasks', 'sortOrder',
                      ],
                    },
                  },
                  {
                    resource: EducationEntry,
                    options: {
                      actions: resumeActions,
                      listProperties: ['degree', 'university', 'duration', 'sortOrder'],
                      editProperties: ['degree', 'university', 'duration', 'sortOrder'],
                    },
                  },
                  {
                    resource: Patent,
                    options: {
                      actions: resumeActions,
                      listProperties: ['link', 'title', 'sortOrder'],
                      editProperties: ['link', 'url', 'title', 'sortOrder'],
                    },
                  },
                  {
                    resource: Certification,
                    options: {
                      actions: resumeActions,
                      listProperties: ['title', 'issuer', 'sortOrder'],
                      editProperties: ['title', 'issuer', 'link', 'sortOrder'],
                    },
                  },
                  {
                    resource: Award,
                    options: {
                      actions: resumeActions,
                      listProperties: ['title', 'issuer', 'sortOrder'],
                      editProperties: ['title', 'issuer', 'sortOrder'],
                    },
                  },
                  // ── Blog ─────────────────────────────────────────────────
                  {
                    resource: Tag,
                    options: {
                      actions: blogActions,
                      listProperties: ['name'],
                      editProperties: ['name'],
                    },
                  },
                  {
                    resource: new BlogPostResource(BlogPost, dataSource),
                    options: {
                      actions: blogActions,
                      listProperties: ['title', 'slug', 'published', 'publishedAt', 'readingTime'],
                      editProperties: [
                        'title', 'excerpt', 'coverImageUrl', 'tags',
                        'rawMarkdown', 'published', 'publishedAt',
                      ],
                      properties: {
                        // ── E5-S6: Markdown editor with image upload ──────────
                        rawMarkdown: {
                          components: { edit: MarkdownEditorComp },
                        },
                        // ── E5-S7: Tag picker with typeahead & inline create ──
                        tags: {
                          components: { edit: TagPickerComp },
                        },
                      },
                    },
                  },
                  // ── Projects ─────────────────────────────────────────────
                  {
                    resource: new ProjectResource(Project, dataSource),
                    options: {
                      actions: projectActions,
                      listProperties: ['title', 'slug', 'company', 'featured', 'published', 'sortOrder'],
                      editProperties: [
                        'title', 'company', 'role', 'startDate', 'endDate',
                        'githubUrl', 'liveDemoUrl', 'featured', 'published', 'sortOrder',
                        'skills', 'description',
                      ],
                      properties: {
                        description: {
                          components: { edit: MarkdownEditorComp },
                        },
                        skills: {
                          components: { edit: SkillPickerComp },
                        },
                      },
                    },
                  },
                  {
                    resource: ProjectMedia,
                    options: {
                      actions: projectActions,
                      listProperties: ['url', 'altText', 'sortOrder'],
                      editProperties: ['url', 'altText', 'sortOrder'],
                      properties: {
                        url: { components: { edit: MediaUploaderComp } },
                      },
                    },
                  },
                  {
                    resource: ProjectVideo,
                    options: {
                      actions: projectActions,
                      listProperties: ['source', 'url', 'title', 'sortOrder'],
                      editProperties: ['source', 'url', 'title', 'sortOrder'],
                      properties: {
                        url: { components: { edit: VideoManagerComp } },
                      },
                    },
                  },
                  // ── Gallery ──────────────────────────────────────────────
                  {
                    resource: Album,
                    options: {
                      actions: {
                        edit:   { after: afterGallery },
                        new:    { after: afterGallery },
                        delete: { after: afterGallery },
                      },
                      listProperties: ['name', 'slug', 'location', 'published', 'sortOrder'],
                      editProperties: [
                        'name', 'description', 'location',
                        'coverId', 'published', 'sortOrder',
                      ],
                    },
                  },
                  {
                    resource: Photo,
                    options: {
                      actions: {
                        edit:   { after: afterGallery },
                        new:    { after: afterGallery },
                        delete: { after: afterGallery },
                      },
                      listProperties: ['thumbUrl', 'title', 'location', 'published', 'sortOrder'],
                      editProperties: [
                        'originalUrl', 'title', 'altText', 'location',
                        'album', 'published', 'sortOrder',
                      ],
                      properties: {
                        originalUrl: {
                          components: { edit: PhotoUploaderComp, show: PhotoUploaderComp },
                        },
                      },
                    },
                  },
                ],
              },
              auth: {
                authenticate: async (email: string, password: string) => {
                  const user = await adminUserService.findAndValidate(
                    email,
                    password,
                  );
                  if (!user) return null;
                  return { email: user.email, id: user.id };
                },
                cookieName:
                  config.get<string>('SESSION_COOKIE_NAME') ?? 'adminjs',
                cookiePassword:
                  config.get<string>('SESSION_SECRET') ?? 'change-me-in-prod',
              },
              sessionOptions: {
                resave: false,
                saveUninitialized: false,
                secret:
                  config.get<string>('SESSION_SECRET') ?? 'change-me-in-prod',
              },
            };
          },
          inject: [AdminUserService, ConfigService, getDataSourceToken()],
        }),
      ],
      exports: [],
    };
  }
}
