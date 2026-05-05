import {
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
import { NoIndexMiddleware } from './common/middleware/no-index.middleware';

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
        return {
          type: 'postgres' as const,
          url: config.get<string>('DATABASE_URL'),
          ssl: isProduction
            ? { rejectUnauthorized: true }
            : { rejectUnauthorized: false },
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize:
            !isProduction && config.get<string>('DB_SYNC') === 'true',
          logging: !isProduction
            ? (['query', 'error', 'migration'] as const)
            : (['error', 'migration'] as const),
          extra: {
            max: parseInt(config.get<string>('DB_POOL_MAX') ?? '10', 10),
            ssl: { rejectUnauthorized: false },
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
          ttl: Number(config.get('THROTTLE_TTL') ?? 60) * 1000,
          limit: Number(config.get('THROTTLE_LIMIT') ?? 20),
        },
      ],
      inject: [ConfigService],
    }),

    // ── Feature modules ────────────────────────────────────────────────────
    AdminUserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NoIndexMiddleware)
      .forRoutes({ path: 'admin*', method: RequestMethod.ALL });
  }
}
