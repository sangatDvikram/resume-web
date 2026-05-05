/**
 * TypeORM DataSource — used by:
 *   1. The NestJS TypeOrmModule at runtime (via DATABASE_URL pooler endpoint)
 *   2. The TypeORM CLI for generating and running migrations (via DATABASE_URL_UNPOOLED direct endpoint)
 *
 * Neon connection notes:
 *   - DATABASE_URL        → pooler endpoint (-pooler suffix). Use for runtime.
 *   - DATABASE_URL_UNPOOLED → direct endpoint. Use ONLY for migrations (DDL is
 *     incompatible with PgBouncer transaction mode).
 */
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local first, then .env (allows local overrides)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const isMigrationCli = process.env.TYPEORM_CLI === 'true';
const useSSL = isProduction || process.env.DB_SSL === 'true';

/**
 * Connection string selection:
 *   - Migration CLI runs: use DATABASE_URL_UNPOOLED (direct connection)
 *   - Runtime: use DATABASE_URL (pooler endpoint)
 */
const connectionUrl = isMigrationCli
  ? (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: connectionUrl,

  // SSL: always on in production; opt-in locally via DB_SSL=true
  ssl: useSSL ? { rejectUnauthorized: isProduction } : false,

  // Entity discovery — scan all .entity.ts files under src/
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],

  // Migration files
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],

  // NEVER allow TypeORM to auto-sync schema in production
  synchronize: !isProduction && process.env.DB_SYNC === 'true',

  // Log queries in development
  logging: !isProduction ? ['query', 'error', 'migration'] : ['error', 'migration'],

  // Extra pg pool options (relevant for the pooler endpoint at runtime)
  extra: {
    // Neon PgBouncer transaction mode: keep pool size conservative
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    ...(useSSL && { ssl: { rejectUnauthorized: isProduction } }),
  },
};

/**
 * DataSource instance — imported by:
 *   - TypeORM CLI:  `typeorm migration:run -d src/database/data-source.ts`
 *   - NestJS app:   TypeOrmModule.forRootAsync() reads dataSourceOptions
 */
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
