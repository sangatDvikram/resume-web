import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AuthModule } from './auth/auth.module';
import { ResumeModule } from './resume/resume.module';
import { BlogModule } from './blog/blog.module';
import { UploadModule } from './upload/upload.module';
import { NoIndexMiddleware } from './common/middleware/no-index.middleware';
import { SqidsModule } from './common/sqids.module';

@Module({
  imports: [
    // ── Config (global) ────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Database ───────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';
        const useSSL = isProduction || config.get<string>('DB_SSL') === 'true';
        return {
          type: 'postgres' as const,
          url: config.get<string>('DATABASE_URL'),
          ssl: useSSL ? { rejectUnauthorized: isProduction } : false,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize:
            !isProduction && config.get<string>('DB_SYNC') === 'true',
          logging: !isProduction
            ? (['query', 'error', 'migration'] as const)
            : (['error', 'migration'] as const),
          extra: {
            max: parseInt(config.get<string>('DB_POOL_MAX') ?? '10', 10),
            ...(useSSL && { ssl: { rejectUnauthorized: isProduction } }),
          },
          // autoLoadEntities picks up entities registered via forFeature()
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),

    // ── Rate limiting ──────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          // Default throttler — applied to general routes
          name: 'default',
          ttl: Number(config.get('THROTTLE_TTL') ?? 60) * 1000,
          limit: Number(config.get('THROTTLE_LIMIT') ?? 20),
        },
        {
          // Login-specific throttler — 10 requests per 15 minutes per IP
          name: 'login',
          ttl: 15 * 60 * 1000,
          limit: 10,
        },
      ],
      inject: [ConfigService],
    }),

    // ── Feature modules ────────────────────────────────────────────────────
    SqidsModule,
    AdminUserModule,
    AuthModule,
    ResumeModule,
    BlogModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /** Called from main.ts so the async AdminJsModule can be awaited before bootstrap. */
  static withAdmin(adminModule: DynamicModule): DynamicModule {
    return {
      module: AppModule,
      imports: [adminModule],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NoIndexMiddleware)
      .forRoutes({ path: 'admin*', method: RequestMethod.ALL });
  }
}
