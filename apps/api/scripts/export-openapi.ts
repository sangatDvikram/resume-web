/**
 * E10-S8: OpenAPI spec exporter.
 *
 * Bootstraps a minimal NestJS application (no HTTP listener),
 * generates the Swagger document, and writes it to docs/openapi.json.
 *
 * Usage:
 *   yarn workspace api generate:openapi
 *
 * The output file (docs/openapi.json) is then consumed by openapi-typescript
 * to regenerate packages/types/src/api.d.ts — see the root package.json
 * `generate:types` script.
 */

import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Load env so ConfigService doesn't complain
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Set dummy values so TypeORM doesn't try to connect
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost/dummy';
process.env.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY ?? 'dummy';
process.env.JWT_PUBLIC_KEY  = process.env.JWT_PUBLIC_KEY  ?? 'dummy';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? 'dummy';
process.env.CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY    ?? 'dummy';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? 'dummy';

async function main() {
  // Import lazily to allow env patching above to take effect first
  const { AppModule } = await import('../src/app.module');

  const app = await NestFactory.create(AppModule, {
    logger: ['error'],      // suppress startup noise
  });
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Portfolio CMS API')
    .setDescription('REST API for the Portfolio CMS platform.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  await app.close();

  const outDir  = path.join(__dirname, '..', '..', '..', 'docs');
  const outFile = path.join(outDir, 'openapi.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`✅ OpenAPI spec written to ${path.relative(process.cwd(), outFile)}`);
}

main().catch(err => {
  console.error('❌ Failed to export OpenAPI spec:', err);
  process.exit(1);
});
