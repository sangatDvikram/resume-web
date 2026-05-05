import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { AdminUserService } from '../admin-user/admin-user.service';
import { AdminUser } from '../admin-user/admin-user.entity';

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
    const { default: AdminJS } = await esmImport('adminjs') as { default: any };
    const { Database, Resource } = await esmImport('@adminjs/typeorm') as { Database: any; Resource: any };

    AdminJS.registerAdapter({ Database, Resource });

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
            AdminUser.useDataSource(dataSource);

            return {
              adminJsOptions: {
                rootPath: '/admin',
                resources: [
                  {
                    resource: AdminUser,
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
            };
          },
          inject: [AdminUserService, ConfigService, getDataSourceToken()],
        }),
      ],
      exports: [],
    };
  }
}
