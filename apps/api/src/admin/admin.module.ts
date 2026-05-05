import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { AdminUserService } from '../admin-user/admin-user.service';
import { AdminUser } from '../admin-user/admin-user.entity';

/**
 * AdminJS v7 is ESM-only. NestJS compiles to CommonJS.
 * We use dynamic import() inside an async factory to bridge the gap.
 *
 * References:
 *   https://docs.adminjs.co/installation/plugins/nest
 */
export class AdminJsModule {
  static async createAsync(): Promise<DynamicModule> {
    // Dynamic ESM imports — must stay as import() calls.
    // AdminJS v7 and its adapters are ESM-only; TypeScript's CommonJS
    // moduleResolution cannot resolve their type declarations directly,
    // so we use ts-ignore here. Runtime behaviour is correct.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — ESM-only package, resolved at runtime via dynamic import
    const { AdminModule } = await import('@adminjs/nestjs');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — ESM-only package
    const AdminJS = (await import('adminjs')).default;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — ESM-only package
    const { Database, Resource, getModelByName } = await import('@adminjs/typeorm'); // eslint-disable-line

    AdminJS.registerAdapter({ Database, Resource });

    return {
      module: AdminJsModule,
      imports: [
        AdminUserModule,
        AdminModule.createAdminAsync({
          useFactory: (
            adminUserService: AdminUserService,
            config: ConfigService,
          ) => ({
            adminJsOptions: {
              rootPath: '/admin',
              resources: [
                {
                  resource: getModelByName('AdminUser'),
                  options: {
                    properties: {
                      passwordHash: { isVisible: false },
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
          }),
          inject: [AdminUserService, ConfigService],
        }),
      ],
      exports: [],
    };
  }
}
