import path from 'path';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
    const { default: AdminJS, ComponentLoader } = await esmImport('adminjs') as { default: any; ComponentLoader: any };
    const { Database, Resource } = await esmImport('@adminjs/typeorm') as { Database: any; Resource: any };

    AdminJS.registerAdapter({ Database, Resource });

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

            const afterResume = makeAfterHook(['resume']);
            const afterBlog   = makeAfterHook(['blog']);

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

            return {
              adminJsOptions: {
                rootPath: '/admin',
                componentLoader,
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
                    resource: BlogPost,
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
                  { resource: Project },
                  { resource: ProjectMedia },
                  { resource: ProjectVideo },
                  // ── Gallery ──────────────────────────────────────────────
                  { resource: Album },
                  { resource: Photo },
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
